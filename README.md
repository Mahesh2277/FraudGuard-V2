# 🚨 FraudGuard: Transaction Fraud Detection and Reporting System

FraudGuard is a full-stack web application designed to **detect, classify, and report fraudulent transactions** using a combination of **rule-based logic** and **machine learning**. The system provides a secure dashboard for monitoring transactions and enables user-driven fraud reporting to continuously improve detection accuracy.

---

## 🚀 Features

### 🔍 Fraud Detection Engine

* Hybrid detection approach combining:

  * Rule-based validation (thresholds, suspicious patterns)
  * Supervised Machine Learning model
* Accurate classification of transactions as **fraudulent or legitimate**

### 🤖 Machine Learning Integration

* Trained and evaluated using **Scikit-learn**
* Used **Pandas** for data preprocessing and analysis
* Tested on synthetic transaction datasets for performance evaluation

### 👤 User & Reporting System

* Secure user authentication using **JWT**
* Users can report suspicious transactions
* Reported data helps enhance future fraud detection and model refinement

### 📊 Interactive Dashboard

* Responsive UI built with **React.js** and **Tailwind CSS**
* Visual overview of transactions and fraud reports
* Secure API communication between frontend and backend

---

## 🛠 Tech Stack

| Technology   | Usage                          |
| ------------ | ------------------------------ |
| React.js     | Frontend UI                    |
| Tailwind CSS | Responsive styling             |
| Node.js      | Backend runtime                |
| Express.js   | REST API framework             |
| MongoDB      | Database                       |
| Scikit-learn | Machine Learning model         |
| Pandas       | Data processing                |
| JWT          | Authentication & Authorization |

---

## 🧠 System Architecture

* **Frontend**: React + Tailwind for dashboard and user interaction
* **Backend**: Node.js + Express with RESTful APIs
* **ML Layer**: Python-based model for transaction classification
* **Database**: MongoDB for users, transactions, and reports
* **Security**: JWT-based protected routes and API access

---

## ⚙️ Installation & Setup

### 📦 Backend Setup

```bash
git clone <repository-url>
cd backend
npm install
npm start
```

### 🖥 Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 🤖 ML Model Setup

```bash
cd ml
pip install scikit-learn pandas
python train_model.py
```

---

## 📈 Future Enhancements

* Real-time fraud detection alerts
* Integration with real transaction datasets
* Model retraining using reported fraud data
* Advanced analytics and visualizations

---

## 👨‍💻 Author

**Mahesh Waghmare**
Full-Stack Developer | MERN | Machine Learning Enthusiast

---

⭐ *If you like this project, consider giving it a star on GitHub!*
