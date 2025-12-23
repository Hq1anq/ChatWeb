const DateSeparator = ({ date }) => {
  return (
    <div className="flex items-center gap-4 my-4">
      <div className="flex-1 h-px bg-base-300"></div>
      <span className="text-xs text-base-content/60 font-medium px-3 py-1 bg-base-300 rounded-full">
        {date}
      </span>
      <div className="flex-1 h-px bg-base-300"></div>
    </div>
  )
}

export default DateSeparator
















































