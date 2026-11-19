export function tenPmEasternIso(date: string): string {
  const [year, month, day] = date.split("-").map(Number)
  const dateAtTenPmUtc = new Date(Date.UTC(year, month - 1, day, 22))
  const zoneName = new Intl.DateTimeFormat("en-US", {timeZone: "America/New_York", timeZoneName: "shortOffset"})
    .formatToParts(dateAtTenPmUtc)
    .find((part) => part.type === "timeZoneName")?.value || "GMT-05:00"
  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(zoneName)
  if (!match) return `${date}T22:00:00-05:00`
  return `${date}T22:00:00${match[1]}${match[2].padStart(2, "0")}:${match[3] || "00"}`
}

export function tenPmEastern(date: string): Date {
  return new Date(tenPmEasternIso(date))
}
