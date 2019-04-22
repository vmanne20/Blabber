FROM node
WORKDIR /blabber
COPY package* ./
RUN npm install
# VOLUME /data/db
COPY index.js ./

CMD ["node", "index.js"]
HEALTHCHECK --interval=15s --timeout=3s CMD curl -f http://localhost/ || exit 1
EXPOSE 3000
