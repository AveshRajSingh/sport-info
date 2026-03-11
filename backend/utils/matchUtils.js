

const getMatchStatus = (startTime,endTime , now = new Date()) => {
  
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start > now) {
        return 'scheduled';
    }
    if (end < now) {
        return 'completed';
    }

    return 'live';
}


const syncMatchStatus = (match) => {
    const status = getMatchStatus(match.startTime, match.endTime);
    match.status = status;
    return match;
}


export {
    getMatchStatus,
    syncMatchStatus
}