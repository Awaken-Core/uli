import { getDefaultTamaguiConfig } from '@tamagui/config-default'
import { createTamagui } from 'tamagui'

const config = createTamagui(getDefaultTamaguiConfig())

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;