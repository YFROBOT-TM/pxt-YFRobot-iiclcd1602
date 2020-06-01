# YFROBOT MAKECODE Extensions OF IIC LCD1602 FOR MICRO:BIT

## Use as Extension

This repository can be added as an **extension** in MakeCode.

* open [micro:bit_makecode]( https://makecode.microbit.org/ )
* click on **New Project**
* click on **Extensions** under the gearwheel menu
* search for **https://github.com/YFROBOT-TM/pxt-YFRobot-iiclcd1602** and import

## Blocks preview

![A rendered view of the blocks](https://github.com/YFROBOT-TM/pxt-YFRobot-iiclcd1602/blob/master/.github/makecode/blocks.png)

## Extension API

### Example
YFRobotBit.connectLcd(39);
YFRobotBit.showStringOnLcd1602("Hello world!", 0, 15);
YFRobotBit.showStringOnLcd1602("Hello yfrobot!", 16, 15);
YFRobotBit.setLcdBacklight(LcdBacklight.On);
const pos1602: number = YFRobotBit.position1602(LcdPosition1602.P0);
const isLcdConnected: boolean = YFRobotBit.isLcdConnected();

### YFRobotBit showStringOnLcd1602
Displays a text on a LCD1602 in the given position range. The text will be cropped if it is longer than the provided range. If there is space left, it will be filled with whitespaces.

```sig
YFRobotBit.showStringOnLcd1602("Hello world", 0, 15)
```

### YFRobotBit clearLcd

Clears the LCD completely.

```sig
YFRobotBit.clearLcd()
```

### YFRobotBit setLcdBacklight

Enables or disables the backlight of the LCD.

```sig
YFRobotBit.setLcdBacklight(LcdBacklight.On)
```

### YFRobotBit connectLcd

Connects to the LCD at a given I2C address. The addresses 39 (PCF8574) or 63 (PCF8574A) seem to be widely used.

```sig
YFRobotBit.connectLcd(39)
```

### YFRobotBit isLcdConnected

Returns true if a LCD is connected. False otherwise.

```sig
YFRobotBit.isLcdConnected()
```

## License

Licensed under the MIT License (MIT). See LICENSE file for more details.

## Metadata (used for search, rendering)

* for PXT/microbit

```package
YFRobotBit=github:YFROBOT-TM/pxt-YFRobot-iiclcd1602
```
