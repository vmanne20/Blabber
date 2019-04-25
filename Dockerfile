FROM node
WORKDIR /blabber
COPY package* ./
RUN npm install
# VOLUME /data/db
COPY index.js ./

CMD ["node", "index.js"]
HEALTHCHECK --interval=1s --timeout=3s --retries=5 CMD curl -f http://localhost/ || exit 1
EXPOSE 3000
