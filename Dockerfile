FROM node
WORKDIR /blabber
COPY package* ./
RUN npm install
# VOLUME /data/db
COPY index.js ./

CMD ["node", "index.js"]
EXPOSE 3000
