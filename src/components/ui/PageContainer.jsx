function PageContainer({ variant = 'student', wide = false, children, ...rest }) {
  const classes = ['page']
  if (variant === 'teacher') {
    classes.push('page--teacher')
    if (wide !== false) classes.push('page--wide')
  } else {
    classes.push('page--student')
    if (wide) classes.push('page--wide')
  }

  return (
    <main className={classes.join(' ')} {...rest}>
      {children}
    </main>
  )
}

export default PageContainer
