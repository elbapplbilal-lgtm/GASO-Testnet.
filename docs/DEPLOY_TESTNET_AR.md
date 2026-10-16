# نشر GASO في Base Sepolia (اختياري، تجريبي فقط)

**ما ترسل حتى مفتاح سري لشي واحد، حتى لـ ChatGPT.**

هاد الخطوات كتحتاج موافقة منك: ما يمكنش نشر عقد فوق شبكة عامة بلا توقيع معاملة من المحفظة الخاصة بك.

1. أنشئ محفظة **جديدة منفصلة للتجربة فقط**، بلا أموال حقيقية وبلا أي استعمال خارج التجربة.
2. جهز RPC للشبكة **Base Sepolia** وخذ شوية ETH تجريبي من faucet موثوق.
3. في GitHub افتح المستودع > Settings > Secrets and variables > Actions، أضف السرّين `BASE_SEPOLIA_RPC_URL` و `TESTNET_DEPLOYER_KEY`. لا تضعهما في الملفات العامة.
4. افتح Actions > **GASO deploy to Base Sepolia (manual only)** ثم `Run workflow`.
5. بعد النجاح، راجع سجل التشغيل للحصول على عناوين GASO وPaymaster وروابط مستكشف Base Sepolia.
6. قبل تجربة الدفع: تمويل EntryPoint deposit + stake للـPaymaster بعملة ETH تجريبية؛ ربط محفظة ERC-4337؛ إعطاء allowance لـ GASO؛ وتجريب public Bundler يدعم الطلب.

> كود GASO وPaymaster غير مدقق أمنياً. نشرهما ما يعنيش أن خدمة دفع الغاز خدامة. ما تستعمل فلوس حقيقية.

تقدر تختبر كلشي محلياً بلا محفظة أو مفاتيح تشغيل `npm test` عبر GitHub Actions.
