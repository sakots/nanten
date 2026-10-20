# Android・Google Play向けビルド

## 配布する版

Capacitorで既存のReactアプリをAndroidアプリとして実行します。Web／PWA版の `pnpm build` は広告なしのまま維持します。

| 版 | applicationId | 広告 |
| --- | --- | --- |
| Android広告あり | `io.github.sakots.nanten` | 画面下部バナーと10問終了時のインタースティシャル |
| Android広告なし | `io.github.sakots.nanten.adfree` | 広告SDK・同意SDK・広告用権限を含めない |

2つのAndroid版は別アプリとして同時インストールできます。Google Playでも別々に登録します。applicationIdは公開後に変更できないため、初回公開前に確認してください。

## 表示とプライバシー

- 広告あり版だけでGoogle Mobile Ads SDKとUser Messaging Platform（UMP）を使用します。AdMobは通常のWebページでは動作しません。
- 起動時にUMPの同意情報を更新し、必要なら同意画面を表示します。広告リクエストが許可されるまでMobile Adsの初期化・広告取得を行いません。
- 同意の再選択が必要な地域では「広告のプライバシー設定」を表示し、UMPのプライバシーオプション画面を再表示できます。
- バナーはWebViewとは別のネイティブ表示領域に配置します。回答・次へボタンの上に重ねません。取得失敗時は空き領域を残しません。
- インタースティシャルは10問目の回答後に「結果を見る」を押したときだけ表示します。起動時・問題の途中・正誤の表示時には出しません。未取得・同意なし・オフライン・表示失敗時は待たずに結果へ進み、広告を閉じた後も結果へ進みます。連打で重複表示しません。
- 広告なし版とWeb版は広告の初期化・リクエスト・広告設定UIを持ちません。ゲームの出題・回答・成績の仕様は共通です。
- Android版は同梱資産から起動し、Web用のService Workerを使いません。更新はGoogle Play経由です。

## ビルドの区分

- 通常のWebビルド：`pnpm build`
- Androidの広告あり／なし向けWeb資産：`pnpm build:android:ads`／`pnpm build:android:adfree`
- テスト広告付きデバッグAPK：`pnpm android:ads`
- 広告なしデバッグAPK：`pnpm android:adfree`
- Google Play用の署名付きAAB：`pnpm android:ads:release`／`pnpm android:adfree:release`

いずれの本番Web資産ビルドにも、既存のSSH署名検証と `NANTEN_BUILD_SSH_KEY` が必要です。Androidアプリの署名鍵はSSH鍵とは別です。

広告ありデバッグ版はGoogle公式のテスト用アプリIDとバナー・インタースティシャルIDを固定で使用します。実広告を開発中にクリックしないでください。広告ありリリース版では自身のAdMob IDを必須とし、未設定やGoogle公式テスト用IDではビルドを停止します。

広告SDKの公式手順：

- https://capacitorjs.com/docs/getting-started/environment-setup
- https://developers.google.com/admob/android/quick-start
- https://developers.google.com/admob/android/privacy
- https://developers.google.com/admob/android/test-ads

公開前にはAdMobで両広告枠を作成し、プライバシーメッセージ、プライバシーポリシー、app-ads.txtを設定してください。Play Consoleの広告申告・データセーフティ・対象年齢なども実際の運用とSDKのデータ利用に合わせて設定する必要があります。実機で同意・表示・終了・オフライン時の動作を確認してから公開してください。

## 環境構築と設定

1. Node.js 22.12以上、pnpm、OpenSSH、JDK 21、Android SDKを用意します。Android Studio 2025.2.1以降のSDK ManagerでAndroid SDK Platform 36とBuild Toolsをインストールし、`ANDROID_HOME` と必要なら `JAVA_HOME` を設定します。
2. `pnpm install` を実行します。Androidプロジェクトは `android/` に含まれるため、`cap add` の再実行は不要です。
3. `.env.example` を参考に `.env.local` へSSH鍵のパスを設定します。
4. デバッグ版は `pnpm android:ads` または `pnpm android:adfree` でビルドします。選択したWeb資産の生成・Capacitor同期・フレーバー別資産配置・GradleのAPK生成までを順に実行します。同じ作業ディレクトリで2つのコマンドを同時実行しないでください。

WindowsのPowerShellからも同じコマンドを使用します。ビルドスクリプトは `gradlew.bat` を `cmd.exe /d /s /c` 経由で実行します。バッチファイルの直接起動による `spawnSync gradlew.bat EINVAL` を避けるための処理です。Gradleの作業ディレクトリを別途指定するため、プロジェクトのパスに空白が含まれていてもコマンド文字列へ埋め込みません。

広告ありWeb資産は `dist/android-ads/`、広告なしは `dist/android-adfree/` に生成します。これだけではAndroidアプリではありません。広告はネイティブAndroid上でのみ表示します。通常の `pnpm build` は `dist/` を作り直すため、その下のAndroid向けWeb資産も削除します。必要な版のAndroidビルドコマンドを再実行すれば再生成します。

Capacitorが同期する資産はビルドスクリプトが `android/app/src/ads/assets/` または `android/app/src/adfree/assets/` に分離します。フレーバー間で前回の広告コードや設定を共用しません。生成物はGit管理対象外です。

### リリース用の設定

`.env.local` またはCIのシークレットに次の項目を設定します。

```dotenv
NANTEN_ADMOB_APP_ID=
NANTEN_ADMOB_BANNER_ID=
NANTEN_ADMOB_INTERSTITIAL_ID=
NANTEN_ANDROID_KEYSTORE=
NANTEN_ANDROID_STORE_PASSWORD=
NANTEN_ANDROID_KEY_ALIAS=
NANTEN_ANDROID_KEY_PASSWORD=
```

AdMobの3項目は広告ありリリース版だけに必要です。アプリIDは `ca-app-pub-数字16桁~数字10桁`、広告ユニットIDは `ca-app-pub-数字16桁/数字10桁` の形式です。バナー用とインタースティシャル用にそれぞれ正しい形式の広告枠を登録してください。IDの形式確認だけではAdMob上での所有権や枠の種類までは確認できません。

Android署名の4項目は両リリース版に必要です。`NANTEN_ANDROID_KEYSTORE` はアップロード鍵のkeystoreファイルの**絶対パス**です（`~` は使用しません）。Androidアプリの署名鍵はSSHビルド鍵とは別で、既存のSSH鍵ではAABを署名できません。

### 初回のアップロード鍵作成

既に公開済みのアプリ、またはアップロード鍵を作成済みのアプリでは、その鍵を使用してください。更新のたびに新しい鍵を作成しないでください。新規アプリで鍵がない場合だけ、次の手順を実行します。

1. リポジトリ外に鍵の保存先ディレクトリを作成します。Linuxでは例として `~/.local/share/nanten/`、Windowsではユーザーフォルダー内の専用ディレクトリを使用します。
2. JDK付属の `keytool` でアップロード鍵を作成します。以下の `/absolute/path/upload-key.jks` は実際の保存先の絶対パスに置き換えてください。コマンドは改行せず実行します。

   ```sh
   keytool -genkeypair -keystore /absolute/path/upload-key.jks -storetype PKCS12 -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```

   パスワードと証明書の情報を対話形式で入力します。パスワードをコマンド引数やシェル履歴に残さないでください。PKCS12ではキーパスワードとストアパスワードを同じ値にします。

3. Git管理対象外の `.env.local` に設定します。パスワードは作成時に指定した値へ置き換え、例の値をそのまま使わないでください。Windowsのパスは `C:/Users/ユーザー名/…/upload-key.jks` のように `/` で区切れます。

   ```dotenv
   NANTEN_ANDROID_KEYSTORE=/absolute/path/upload-key.jks
   NANTEN_ANDROID_STORE_PASSWORD='作成時のパスワード'
   NANTEN_ANDROID_KEY_ALIAS=upload
   NANTEN_ANDROID_KEY_PASSWORD='作成時のパスワード'
   ```

4. keystoreとパスワードを安全な別の場所へバックアップします。`.env.local` にもパスワードがあるため、Linuxでは `chmod 600 .env.local /absolute/path/upload-key.jks` で読み取りを所有者だけに制限します。Windowsではファイルのアクセス権を制限します。秘密鍵やパスワードをGitへ追加したり、AABと一緒に配布したりしないでください。

### AABの生成とアップロード

設定後、リポジトリ直下で公開する版のコマンドを実行します。Web資産生成・Capacitor同期・リリース署名・AAB生成まで行うため、Android Studioでの再署名は不要です。

```sh
pnpm android:ads:release
pnpm android:adfree:release
```

両方公開する場合だけ2つのコマンドを順番に実行します。広告なし版にAdMob IDは不要です。`Release requires NANTEN_ANDROID_KEYSTORE.` で停止した場合は署名設定が読み込まれていません。上記4項目が空欄でないことを確認してください。

| コマンド | 生成先 |
| --- | --- |
| `pnpm android:ads` | `android/app/build/outputs/apk/ads/debug/app-ads-debug.apk` |
| `pnpm android:adfree` | `android/app/build/outputs/apk/adfree/debug/app-adfree-debug.apk` |
| `pnpm android:ads:release` | `android/app/build/outputs/bundle/adsRelease/app-ads-release.aab` |
| `pnpm android:adfree:release` | `android/app/build/outputs/bundle/adfreeRelease/app-adfree-release.aab` |

現在のversionCodeは801、versionNameは0.8.1です（`android/app/build.gradle`）。Google Playへの更新では、versionCodeを既にアップロード済みの値より大きくし、versionNameもリリースに合わせて更新してください。広告なし版は広告あり版と別のPlay Consoleアプリとして登録します。デバッグAPKを製品版として公開しないでください。

生成した `.aab` をPlay Consoleの内部テストなどのリリースへアップロードします。初回はPlay App Signingの登録手順に従い、作成した鍵をアップロード鍵として使用します。AABは直接端末にインストールするファイルではありません。Play経由のインストール・起動と公開前の確認を終えてから製品版へ進めてください。

署名はJDK付属の `jarsigner -verify android/app/build/outputs/bundle/adsRelease/app-ads-release.aab` などで確認できます。アップロード鍵の証明書は自己署名のため、証明書チェーンに関する警告だけでは署名失敗とは限りません。署名の検証とPlay Consoleでの受け入れは別で、ストア情報・ポリシー申告・実機での動作確認も必要です。

## 公開前の動作確認

1. 2つのAPKを同一端末にインストールし、別アプリとして起動することを確認します。
2. 広告あり版で同意が必要な場合の画面とプライバシー設定の再表示を確認します。同意が必要ない地域では設定ボタンが表示されないことも確認します。
3. バナーと固定の回答・次へボタンが重ならず、キーボード表示中や回転時にも操作できることを確認します。
4. 10問目の「結果を見る」で取得済みインタースティシャルが表示され、閉じると成績を表示することを確認します。起動時や1〜9問目には表示されないこと、連打で重複しないことも確認します。
5. オフライン・取得失敗・同意未取得でも回答と結果表示が止まらないことを確認します。
6. 広告なし版にバナー・全画面広告・広告設定UIがなく、広告関連の権限やSDKが含まれないことを確認します。
7. リリース版にGoogle公式テストIDやデバッグ設定が残っていないこと、Web版のPWA更新通知がAndroid版にないことを確認します。

### v0.8.0実装時の検証範囲

Web・広告ありAndroid・広告なしAndroidの資産ビルド、両デバッグAPKの生成、広告なし版の一時署名鍵によるAAB生成を確認しました。一時鍵で署名したAABは配布しないため削除しています。APK内のクラスと権限を調べ、広告なし版にAdMob・UMP・広告ID権限が含まれないことも確認しました。広告ありリリース版は、AdMob ID未設定・Google公式テストID、およびリリース署名未設定を拒否します。

Web版と両Android向け資産はブラウザーで10問から結果表示まで確認しました。広告あり資産のブラウザー確認は、ネイティブプラグインがない場合の続行経路だけを対象とし、広告表示の代用とはしていません。検証環境はKVM権限がなく、ソフトウェアエミュレーターの起動も完了しなかったため、ネイティブ広告・UMP画面の実表示やAndroidの計測テスト実行は未確認です。公開前には上記の実機確認が必要です。

### v0.8.1のAAB生成確認

Android署名鍵が未設定だと `Release requires NANTEN_ANDROID_KEYSTORE.` で停止することを確認しました。リポジトリ外にRSA 2048bit・有効期間10000日のアップロード鍵を作成し、`.env.local` に署名の4項目を設定した後、広告あり・広告なし両方のリリースコマンドが成功しました。生成したAABはversionCode 801、versionName 0.8.1、targetSdkVersion 36です。

両AABは `jarsigner -verify` の署名検証と、Google公式 [bundletool 1.18.3](https://github.com/google/bundletool/releases/tag/1.18.3) の `validate` を通過しました。`jarsigner` は自己署名証明書・タイムスタンプなし・POSIX属性・JarFile/JarInputStream間の読み取り差について警告を出しています。Play Consoleへのアップロードと実機確認は未実施です。作成したアップロード鍵は以後のビルドでも使用するため、削除せずパスワードとともにバックアップしてください。
