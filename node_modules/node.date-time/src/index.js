const leftpad = require("left-pad");
(function () {
  const formatter = function (rule, date = new Date(), utc = false) {
    if (date.constructor !== Date) {
      date = new Date(Date.parse(date));
    }
    return (
      rule
      .replace(/yyyy|Y/g, utc ? date.getUTCFullYear() : date.getFullYear())
      .replace(/yy|y/g, String((utc ? date.getUTCFullYear() : date.getFullYear())).substr(-2, 2))
      .replace(/MM/g, leftpad(String((utc ? date.getUTCMonth() : date.getMonth()) + 1), 2, "0"))
      .replace(/M/g, (utc ? date.getUTCMonth() : date.getMonth()) + 1)
      .replace(/dd/g, leftpad(String((utc ? date.getUTCDate() : date.getDate())), 2, "0"))
      .replace(/d/g, utc ? date.getUTCDate() : date.getDate())
      .replace(/D/g, utc ? date.getUTCDay() : date.getDay())
      .replace(/HH|hh/g, leftpad(String((utc ? date.getUTCHours() : date.getHours())), 2, "0"))
      .replace(/H|h/g, utc ? date.getUTCHours() : date.getHours())
      .replace(/ms/g, utc ? date.getUTCMilliseconds() : date.getMilliseconds())
      .replace(/mm/g, leftpad(String((utc ? date.getUTCMinutes() : date.getMinutes())), 2, "0"))
      .replace(/m/g, leftpad(String((utc ? date.getUTCMinutes() : date.getMinutes())), 2, "0"))
      .replace(/SS/g, leftpad(String((utc ? date.getUTCSeconds() : date.getSeconds())), 2, "0"))
      .replace(/S/g, utc ? date.getUTCSeconds() : date.getSeconds())
    );
  };

  Date.prototype.format = function (rule, utc = false) {
    return formatter(rule, this, utc);
  };

  if (typeof exports === "object") {
    module.exports = formatter;
  } else {
    this.format = formatter;
  }
}());
