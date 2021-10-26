FROM ubuntu:18.04
USER root
ENV NODE_ENV=production

WORKDIR /

RUN apt-get update

RUN apt-get -y install software-properties-common
RUN echo "deb http://ppa.launchpad.net/chris-needham/ppa/ubuntu bionic main deb-src http://ppa.launchpad.net/chris-needham/ppa/ubuntu bionic main" > /etc/apt/sources.list.d/ppa-launchpad.list
RUN add-apt-repository ppa:chris-needham/ppa
RUN apt-get update
RUN apt-get -y install audiowaveform

RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_10.x  | bash -
RUN apt-get -y install nodejs

RUN apt-get -y remove curl gnupg software-properties-common

COPY package.json .
COPY src /src

RUN npm install

EXPOSE 5005

CMD npm start