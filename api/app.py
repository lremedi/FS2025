from flask import Flask, request, jsonify
from query_service import query

app = Flask(__name__)

@app.route('/search', methods=['POST'])
def query_hits():
    data = request.get_json()
    if not data or 'term' not in data:
        return jsonify({"error": "Query parameter is required"}), 400

    term = data['term']
    hits = query(query=term)

    return jsonify(hits)

if __name__ == '__main__':
    app.run(debug=True)