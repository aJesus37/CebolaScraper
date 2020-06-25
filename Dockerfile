FROM archlinux

RUN pacman -Sy tor torsocks nodejs --noconfirm
RUN useradd node
RUN usermod -aG tor node
RUN chown node:tor /var/lib/tor
COPY entrypoint.sh /tmp/entrypoint.sh
RUN chmod +x /tmp/entrypoint.sh
RUN mkdir -p /home/node/cebolaScraper
RUN chown -R node:node /home/node
USER node
RUN echo "cd /home/node/cebolaScraper" > ~/.bashrc
CMD ["/tmp/entrypoint.sh"]
