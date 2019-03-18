FROM node
WORKDIR /Users/vmanne20/Documents/Docker/CS2304_semester_project_manne_dinardov
COPY package* ./
RUN npm install
COPY index.js .

CMD ["node", "index.js"]
EXPOSE 3000
