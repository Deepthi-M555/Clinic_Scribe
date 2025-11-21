// utils/response.js
function success(res, data = {}, status = 200) {
  return res.status(status).json({ ok: true, ...data });
}

function error(res, message = 'Server error', status = 500) {
  return res.status(status).json({ ok: false, error: message });
}

module.exports = { success, error };
