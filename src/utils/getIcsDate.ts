export const getIcsDate = (input: any): number[] => {
  const myDate = new Date(input);
  const icsDate: number[] = [
    myDate.getFullYear(),
    myDate.getMonth() + 1,
    myDate.getDate(),
    myDate.getHours(),
    myDate.getMinutes(),
  ];
  return icsDate;
};
