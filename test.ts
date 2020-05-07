// tests go here; this will not be compiled when this package is used as an extension.
YFRobotBit.connectLcd(39);
YFRobotBit.showStringOnLcd1602("Hello world!", 0, 15);
YFRobotBit.showStringOnLcd1602("YFRobot & Micro:bit!", 16, 15);
YFRobotBit.setLcdBacklight(LcdBacklight.On);
const pos1602: number = YFRobotBit.position1602(LcdPosition1602.P0);
const isLcdConnected: boolean = YFRobotBit.isLcdConnected();