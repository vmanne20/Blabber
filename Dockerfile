FROM node
WORKDIR /blabber_app
COPY package* ./
RUN npm install
RUN npm install -g nodemon
COPY index.js .

CMD ["node", "index.js"]
EXPOSE 3000
