

const calculateStreak = (lastLoginDate, currentStreak) => {
    if (!lastLoginDate) return 1;

    const now = new Date();
    const last = new Date(lastLoginDate);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastLogin = new Date(last.getFullYear(), last.getMonth(), last.getDate());

    const diffInMs = today.getTime() - lastLogin.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 1) {
        return currentStreak + 1;
    } else if (diffInDays === 0) {
        return currentStreak;
    } else {
        return 1;
    }
};

module.exports = { calculateStreak };