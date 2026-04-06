from sklearn.ensemble import RandomForestClassifier

def train_model(X_train, y_train):
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    return model

def predict_improvement(model, student_features):
    prediction = model.predict([student_features])
    return prediction[0]
