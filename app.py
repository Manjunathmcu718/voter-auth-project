from flask import Flask, render_template, request, redirect, url_for, session
import pandas as pd
import random

app = Flask(__name__)
app.secret_key = "supersecretkey"  # needed for session

VOTERS_FILE = "voters.csv"
LOG_FILE = "logs.txt"


# 🏠 Home page → Aadhaar + Phone entry
@app.route("/")
def home():
    return render_template("index.html")


# ✅ Verify Aadhaar + Phone + Age + Form6
@app.route("/verify", methods=["POST"])
def verify():
    aadhar = request.form["aadhar"].strip()
    phone = request.form["phone"].strip()

    voters = pd.read_csv(VOTERS_FILE, dtype=str)

    # Check if Aadhaar exists
    voter = voters[voters["aadhar"] == aadhar]

    if voter.empty:
        return render_template("result.html", message="❌ Aadhaar not found!")

    voter = voter.iloc[0]  # take the row

    # Check phone
    if voter["phone"] != phone:
        return render_template("result.html", message="❌ Phone number mismatch!")

    # Check age
    if int(voter["age"]) < 18:
        return render_template("result.html", message="❌ Voter is under 18 (Not eligible).")

    # Check form6 status
    if voter["form6_status"].lower() != "approved":
        return render_template("result.html", message="❌ Voter Form-6 not approved!")

    # Check already voted
    if voter["voted"].lower() == "yes":
        return render_template("result.html", message="❌ Already voted! Duplicate attempt flagged.")

    # Generate OTP (fake 6 digit)
    otp = str(random.randint(100000, 999999))
    session["otp"] = otp
    session["aadhar"] = aadhar

    print("DEBUG: OTP is", otp)  # in real app send SMS, here show in console

    return render_template("otp.html", message="OTP sent to your phone (check console for demo).")


# 🔑 Validate OTP
@app.route("/validate_otp", methods=["POST"])
def validate_otp():
    entered_otp = request.form["otp"].strip()
    if "otp" not in session or "aadhar" not in session:
        return render_template("result.html", message="❌ Session expired, try again.")

    if entered_otp != session["otp"]:
        return render_template("result.html", message="❌ Incorrect OTP!")

    # Mark voter as voted
    voters = pd.read_csv(VOTERS_FILE, dtype=str)
    voters.loc[voters["aadhar"] == session["aadhar"], "voted"] = "yes"
    voters.to_csv(VOTERS_FILE, index=False)

    # Log the vote
    with open(LOG_FILE, "a") as f:
        f.write(f"Voter {session['aadhar']} voted successfully.\n")

    return render_template("result.html", message="✅ Vote cast successfully! Thank you for voting.")


if __name__ == "__main__":
    app.run(debug=True)
