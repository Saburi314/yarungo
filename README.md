# TODO管理アプリ: YARUNGO   
## https://yarungo.com/

このプロジェクトは Django を使用して構築された TODO 管理アプリケーションです。

SaburiがDjango及びインフラ周りを学習する為に作成しました。

---

## 開発環境構築手順

Docker を使用してアプリケーションを構築し、ローカル環境で実行する方法を説明します。

1. **プロジェクトのクローン**  
   任意のディレクトリで以下のコマンドを実行して、プロジェクトをローカル環境にコピーします。
   ```bash
   git clone https://github.com/Saburi314/yarungo.git
   cd yarungo
2. **.env.example ファイルをコピーして、.env ファイルを作成**

    ```bash
    cp -ap .env.example .env
3. **マイグレーションファイルの作成**

    ```bash
    python manage.py makemigrations

    マイグレーションの適用
    python manage.py migrate
4. **スーパーユーザーの作成**
    管理画面にアクセスするためのスーパーユーザーを作成します。

    ```bash
    python manage.py createsuperuser

その後、任意のユーザー名、メールアドレス、パスワードを入力します。

入力した情報は管理画面にログインするために必要ですので、忘れないようにしてください。