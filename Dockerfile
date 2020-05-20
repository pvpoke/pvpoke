FROM php:5.6.39-apache-jessie

RUN apt-get update
RUN apt-get -y install wget net-tools
RUN wget https://www.apachefriends.org/xampp-files/7.3.18/xampp-linux-x64-7.3.18-0-installer.run
RUN chmod +x xampp-linux-x64-7.3.18-0-installer.run
RUN ./xampp-linux-x64-7.3.18-0-installer.run
RUN rm xampp-linux-x64-7.3.18-0-installer.run

# Enable XAMPP web interface(remove security checks)
RUN /opt/lampp/bin/perl -pi -e s'/Require local/Require all granted/g' /opt/lampp/etc/extra/httpd-xampp.conf

# Enable includes of several configuration files
RUN mkdir /opt/lampp/apache2/conf.d && \
echo "IncludeOptional /opt/lampp/apache2/conf.d/*.conf" >> /opt/lampp/etc/httpd.conf

# Add xampp binaires to .bashrc
RUN echo "export PATH=\$PATH:/opt/lampp/bin/" >> /root/.bashrc
RUN echo "export TERM=xterm" >> /root/.bashrc

# Copy files to /pvpoke folder and a symbolic link to it in /opt/lampp/htdocs.
# It'll be accessible via http://localhost:[port]/pvpoke/src/
# This is convenient because it doesn't interfere with xampp, phpmyadmin or other tools in /opt/lampp/htdocs
COPY src /pvpoke/src
RUN ln -s /pvpoke /opt/lampp/htdocs/

EXPOSE 80 443 3306

# run a shell so we don't exit
CMD /opt/lampp/lampp start && tail -F /var/log/apache2/error.log
