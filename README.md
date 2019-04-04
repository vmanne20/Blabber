# CS2304_semester_project_manne_dinardov
Semester Project for CS2304: Docker Containerization. 

Authors: Vincent Di Nardo and Vamsi Manne

## To Run Test Image:

In root of project, run:

`docker-compose up -d`

`docker-compose rm tests` (optional) (answer 'yes' if prompted)

`docker-compose up tests`

If you see "Error: connect ECONNREFUSED 172.25.0.5:3000" in your test logs, this means that the api container has not finished setting up. Wait a little bit and try running `docker-compose up tests` again until that error no longer shows. 