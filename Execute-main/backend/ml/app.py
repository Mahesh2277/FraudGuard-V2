from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

with open("fraud_detection_model.pkl", "rb") as file:
    model = pickle.load(file)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        payer_id_str = str(data.get("payer_id", "0"))
        payer_id_numeric = abs(hash(payer_id_str)) % 1000000
        
        ip_address = data.get("ip_address", "0.0.0.0")
        if ':' in ip_address:
            ip_numeric = abs(hash(ip_address)) % 1000000
        else:
            ip_parts = ip_address.split('.')
            try:
                ip_numeric = sum(int(part) * (256 ** (3 - i)) for i, part in enumerate(ip_parts[:4])) if len(ip_parts) == 4 else 0
            except:
                ip_numeric = abs(hash(ip_address)) % 1000000
        
        state_str = str(data.get("state", "Unknown"))
        state_numeric = abs(hash(state_str)) % 1000

        input_data = {
            "payer_id": [float(payer_id_numeric)],
            "amount": [float(data.get("amount", 0))],
            "ip_address": [float(ip_numeric)],
            "state": [float(state_numeric)],
            "failed_attempt": [int(data.get("failed_attempt", 0))]
        }

        input_df = pd.DataFrame(input_data)
        input_df = input_df.astype({
            'payer_id': 'float64',
            'amount': 'float64',
            'ip_address': 'float64',
            'state': 'float64',
            'failed_attempt': 'int64'
        })

        try:
            prediction = model.predict(input_df)[0]
            return jsonify({"fraudulent": bool(prediction)})
        except Exception:
            amount = float(data.get("amount", 0))
            failed_attempt = int(data.get("failed_attempt", 0))
            is_fraud = amount > 10000 or failed_attempt > 3
            return jsonify({"fraudulent": is_fraud})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=5001, debug=True)