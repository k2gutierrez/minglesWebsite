import localFont from 'next/font/local'

const vietnamItalic = localFont({
  src: '../../public/fonts/BeVietnamPro-Italic.ttf',
  variable: '--font-vietnamItalic'
})

const vietnamLight = localFont({
  src: '../../public/fonts/BeVietnamPro-Light.ttf',
  variable: '--font-vietnamLight'
})

const vietnamMedium = localFont({
  src: '../../public/fonts/BeVietnamPro-Medium.ttf',
  variable: '--font-vietnamMedium'
})

export {vietnamItalic, vietnamLight, vietnamMedium}