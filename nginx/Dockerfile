FROM nginx:latest

WORKDIR /etc/nginx

# 設定ファイルをコピー
COPY conf.d /etc/nginx/conf.d

# 必要なディレクトリを作成し、証明書を生成
RUN mkdir -p /etc/ssl/private && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/selfsigned.key \
    -out /etc/ssl/private/selfsigned.crt \
    -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Development/OU=IT/CN=localhost"
