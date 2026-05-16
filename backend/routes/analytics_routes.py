from flask import Blueprint, jsonify, request, send_file
import os
import io
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Apply a clean global style for plots
plt.style.use('seaborn-v0_8-whitegrid')

# Directory containing archived CSVs
ARCHIVE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'archive')

analytics_bp = Blueprint('analytics_bp', __name__)


def _safe_path(filename: str) -> str:
    # prevent path traversal and ensure file exists within ARCHIVE_DIR
    safe_name = os.path.basename(filename)
    path = os.path.join(ARCHIVE_DIR, safe_name)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"File not found: {safe_name}")
    if not safe_name.lower().endswith('.csv'):
        raise ValueError('Only .csv files are supported')
    return path


def _load_df(filename: str) -> pd.DataFrame:
    path = _safe_path(filename)
    try:
        df = pd.read_csv(path)
    except Exception:
        # fallback with more permissive options
        df = pd.read_csv(path, encoding_errors='ignore', engine='python')
    return df


@analytics_bp.route('/api/analytics/files', methods=['GET'])
def list_files():
    try:
        files = [f for f in os.listdir(ARCHIVE_DIR) if f.lower().endswith('.csv')]
        return jsonify({'files': sorted(files)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/api/analytics/table', methods=['GET'])
def table_preview():
    filename = request.args.get('file')
    try:
        if not filename:
            return jsonify({'error': 'Missing required query param: file'}), 400
        limit = int(request.args.get('limit', 20))
        df = _load_df(filename)
        # Convert to JSON-serializable types
        rows = df.head(limit).replace({np.nan: None}).to_dict(orient='records')
        return jsonify({
            'file': os.path.basename(filename),
            'columns': list(df.columns),
            'rows': rows,
            'total_rows': int(df.shape[0])
        })
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/api/analytics/summary', methods=['GET'])
def summary():
    filename = request.args.get('file')
    try:
        if not filename:
            return jsonify({'error': 'Missing required query param: file'}), 400
        df = _load_df(filename)
        dtypes = {c: str(dt) for c, dt in df.dtypes.items()}
        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        cat_cols = [c for c in df.columns if c not in numeric_cols]
        describe = df[numeric_cols].describe().replace({np.nan: None}).to_dict() if numeric_cols else {}
        # top values for categorical columns (up to 5)
        top_values = {}
        for c in cat_cols:
            vc = df[c].astype('string', errors='ignore').value_counts(dropna=True).head(5)
            top_values[c] = vc.to_dict()
        return jsonify({
            'file': os.path.basename(filename),
            'columns': list(df.columns),
            'dtypes': dtypes,
            'numeric_columns': numeric_cols,
            'summary': describe,
            'top_values': top_values,
            'row_count': int(df.shape[0])
        })
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/api/analytics/plot', methods=['GET'])
def plot():
    filename = request.args.get('file')
    kind = request.args.get('kind', 'hist')  # hist, bar, line
    column = request.args.get('column')
    bins = int(request.args.get('bins', 30))
    top = int(request.args.get('top', 10))
    try:
        if not filename:
            return jsonify({'error': 'Missing required query param: file'}), 400
        df = _load_df(filename)
        fig, ax = plt.subplots(figsize=(9, 5))

        # Common styling
        ax.grid(True, alpha=0.3)
        ax.set_facecolor('#ffffff')

        if kind == 'hist':
            # choose a numeric column
            if not column:
                numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
                if not numeric_cols:
                    return jsonify({'error': 'No numeric columns available for histogram'}), 400
                column = numeric_cols[0]
            ax.hist(df[column].dropna().astype(float), bins=bins, color='#667eea', edgecolor='white')
            ax.set_title(f'Histogram of {column}', fontsize=12, fontweight='600')
            ax.set_xlabel(column)
            ax.set_ylabel('Frequency')
        elif kind == 'bar':
            # top categories by frequency for a string column
            if not column:
                # pick first non-numeric column
                cat_cols = [c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c])]
                if not cat_cols:
                    return jsonify({'error': 'No categorical columns available for bar plot'}), 400
                column = cat_cols[0]
            vc = df[column].astype('string', errors='ignore').value_counts().head(top)
            vc.plot(kind='bar', ax=ax, color='#27ae60')
            ax.set_title(f'Top {top} {column}', fontsize=12, fontweight='600')
            ax.set_ylabel('Count')
            plt.xticks(rotation=30, ha='right')
            plt.tight_layout()
        elif kind == 'line':
            # line plot of a numeric column over index
            if not column:
                numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
                if not numeric_cols:
                    return jsonify({'error': 'No numeric columns available for line plot'}), 400
                column = numeric_cols[0]
            ax.plot(df[column].astype(float).reset_index(drop=True), color='#e67e22', linewidth=2)
            ax.set_title(f'Line plot of {column}', fontsize=12, fontweight='600')
            ax.set_xlabel('Index')
            ax.set_ylabel(column)
        else:
            return jsonify({'error': f'Unsupported kind: {kind}'}), 400

        buf = io.BytesIO()
        plt.tight_layout()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=150)
        plt.close(fig)
        buf.seek(0)
        return send_file(buf, mimetype='image/png')
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        # ensure figure is closed on errors
        plt.close('all')
        return jsonify({'error': str(e)}), 500
