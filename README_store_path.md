# ヒントの町（PWA/アプリ配信への道）

## 0. このパックの使い方（PWA）
- フォルダをそのままWebに**HTTPSで公開**（例：GitHub Pages, Netlify, Vercel など）
- PC/AndroidでURLを開く → 「ホーム画面に追加」でインストール（PWA）
- ローカル確認は: `python3 -m http.server 8080` → `http://localhost:8080`

## 1. Androidアプリ化（Capacitor）
```bash
# Node.jsをインストール後
npm init -y
npm install @capacitor/cli @capacitor/core
npx cap init hint-town jp.example.hinttown --web-dir=.
npx cap add android
npx cap copy
npx cap open android  # Android Studio が開く
# アイコン/スプラッシュ、バージョン、パッケージ名を調整して、AABビルド（リリース）
```
- Play ConsoleにAABをアップロード、**プライバシーポリシーURL** と **Data Safety** を記入。

## 2. iOSアプリ化（Capacitor）
```bash
npx cap add ios
npx cap copy
npx cap open ios     # Xcode が開く
# Bundle Identifier、署名チーム、ビルド設定を調整して、Archive → Distribute
```
- App Store Connectでメタデータ（年齢レーティング、プライバシー）を登録。

## 3. ストアに出す前の最低チェックリスト
- [ ] アプリ名/アイコン/スプラッシュ（このパックのiconsは暫定）
- [ ] 端末の**バックキー**（Android）で意図した挙動
- [ ] **オフライン動作**と**初回起動**のスムーズさ（SWのキャッシュ）
- [ ] セーブデータ：`localStorage`/`IndexedDB` を使う（クリアボタンも）
- [ ] 設定メニュー（音量/振動/言語）
- [ ] 権利表示/クレジット/プライバシーポリシー（Webで1ページ用意）
- [ ] 収益化（広告/IAP）を入れる場合はSDKポリシー遵守

## 4. 将来の拡張に向けて（移行しやすい設計）
- 住人/性格/インスピレーションの**ルール表はJSON**に分離
- ロジック（シミュレーション）と描画（Canvas）を**分割**（WASM置換しやすい）
- セーブ形式は**バージョン付き**に
- 可能なら**TypeScript**化して規模に耐える構造へ

困ったら、このフォルダをZIPごと共有してくれれば、こちらでCapacitor設定やストア向け調整まで手当てします。
