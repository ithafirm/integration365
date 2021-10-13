const sendToTeams = require('./sendToTeams');

const invitedIdEvent = [];

async function sendTimelineMessage(roomId, client) {
  const room = client.getRoom(roomId);
  for (let i = 0; i < room.timeline.length; i++) {
    const t = room.timeline[i];
    if (t.event.type === 'm.room.message') {
      const user = client.getUser(t.event.sender);
      await sendToTeams(
        t.event.getDate().toUTCString(),
        t.event.content.body,
        room.name,
        user.avatarUrl,
        user.displayName,
        t.event.room_id,
        t.event.content.url,
      );
    }
  }
}

module.exports = async (client) => {
  const dateStartServer = +new Date();

  client.on('RoomMember.membership', function (event, member) {
    if (
      member.membership === 'invite' &&
      member.userId === client.credentials.userId &&
      +event.getDate() > dateStartServer && // проверка на старое событие
      !invitedIdEvent.includes(event.event.event_id)
    ) {
      invitedIdEvent.push(event.event.event_id);
      client.joinRoom(member.roomId).then(function () {
        sendTimelineMessage(member.roomId, client);
      });
    }
  });

  client.on('event', function (event) {
    if (event.getType() !== 'm.room.message') {
      return; // only use messages
    }
    //  если сообщение было прислано раньше времени запуска сервера,
    //  значит это устаревшие сообщения
    if (+event.getDate() < dateStartServer) {
      return;
    }
    //  если совпадает с ид юзером приложения
    //  то это технических пользователь, пропускаем
    const user = client.getUser(event.event.sender);
    if (user.userId === process.env.MATRIX_USER_ID) {
      return;
    }

    const room = client.getRoom(event.event.room_id);

    sendToTeams(
      event.getDate().toUTCString(),
      event.event.content.body,
      room.name,
      user.avatarUrl,
      user.displayName,
      event.event.room_id,
      event.event.content.url,
    );
  });
};
