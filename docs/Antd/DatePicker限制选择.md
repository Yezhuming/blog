# DatePicker限制选择

```js
const range = (start: any, end: any) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

// 限制日期
const disabledDate = (current: any) => current && current < moment().endOf('day').subtract(1, "days");

// 限制时间
const disabledTime = (date: any) => {
  const hours = moment().hours();
  const minutes = moment().minutes();
  const seconds = moment().seconds();
  if (!date) {
    return {
      disabledHours: () => range(0, 24),
      disabledMinutes: () => range(0, 60),
      disabledSeconds: () => range(0, 60)
    };
  }
	// 当日只能选择当前时间之后的时间点
  if (date && moment(date).date() === moment().date()) {
    return {
      disabledHours: () => {
        if (moment(date).date() === moment().date()) {
          return range(0, 24).splice(0, hours)
        }
      },
      disabledMinutes: () => {
        if (moment(date).hours() === moment().hours()) {
          return range(0, 60).splice(0, minutes + 1)
        }
      },
      disabledSeconds: () => {
        if (moment(date).hours() === moment().hours() && moment(date).minutes() === moment().minutes()) {
          return range(0, 60).splice(0, seconds + 1)
        }
      }
    };
  }
  return {
    disabledHours: () => [],
    disabledMinutes: () => [],
    disabledSeconds: () => []
  };
};
```