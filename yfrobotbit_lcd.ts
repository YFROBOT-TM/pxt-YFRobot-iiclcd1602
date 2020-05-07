/** 
 * YFRobot Microbit blocks supporting an I2C LCD 1602 display
 * http://www.yfrobot.com
 * email: yfrobot@qq.com
 */

const enum LcdPosition1602 {
  //% block="0"
  P0 = 0,
  //% block="1"
  P1 = 1,
  //% block="2"
  P2 = 2,
  //% block="3"
  P3 = 3,
  //% block="4"
  P4 = 4,
  //% block="5"
  P5 = 5,
  //% block="6"
  P6 = 6,
  //% block="7"
  P7 = 7,
  //% block="8"
  P8 = 8,
  //% block="9"
  P9 = 9,
  //% block="10"
  P10 = 10,
  //% block="11"
  P11 = 11,
  //% block="12"
  P12 = 12,
  //% block="13"
  P13 = 13,
  //% block="14"
  P14 = 14,
  //% block="15"
  P15 = 15,
  //% block="16"
  P16 = 16,
  //% block="17"
  P17 = 17,
  //% block="18"
  P18 = 18,
  //% block="19"
  P19 = 19,
  //% block="20"
  P20 = 20,
  //% block="21"
  P21 = 21,
  //% block="22"
  P22 = 22,
  //% block="23"
  P23 = 23,
  //% block="24"
  P24 = 24,
  //% block="25"
  P25 = 25,
  //% block="26"
  P26 = 26,
  //% block="27"
  P27 = 27,
  //% block="28"
  P28 = 28,
  //% block="29"
  P29 = 29,
  //% block="30"
  P30 = 30,
  //% block="31"
  P31 = 31
}

const enum LcdBacklight {
  //% block="off"
  Off = 0,
  //% block="on"
  On = 8
}

const enum TextAlignment {
  //% block="left-aligned"
  Left,
  //% block="right-aligned"
  Right
}

const enum TextOption {
  //% block="align left"
  AlignLeft,
  //% block="align right"
  AlignRight,
  //% block="pad with zeros"
  PadWithZeros
}

namespace YFRobotBit {
  const enum Lcd {
    Command = 0,
    Data = 1
  }

  interface LcdState {
    i2cAddress: uint8;
    backlight: LcdBacklight;
    characters: Buffer;
    rows: uint8;
    columns: uint8;
    cursor: uint8;
  }

  let lcdState: LcdState = undefined;
  let hasTriedToAutoConnect = false;

  function connect(): boolean {
    if (hasTriedToAutoConnect) {
      return false;
    }
    hasTriedToAutoConnect = true;

    if (0 != pins.i2cReadNumber(39, NumberFormat.Int8LE, false)) {
      // PCF8574
      connectLcd(39);
    } else if (0 != pins.i2cReadNumber(63, NumberFormat.Int8LE, false)) {
      // PCF8574A
      connectLcd(63);
    }

    return !!lcdState;
  }

  // Write 4 bits (high nibble) to I2C bus
  function write4bits(value: number) {
    if (!lcdState && !connect()) {
      return;
    }
    pins.i2cWriteNumber(lcdState.i2cAddress, value, NumberFormat.Int8LE);
    pins.i2cWriteNumber(lcdState.i2cAddress, value | 0x04, NumberFormat.Int8LE);
    control.waitMicros(1);
    pins.i2cWriteNumber(
      lcdState.i2cAddress,
      value & (0xff ^ 0x04),
      NumberFormat.Int8LE
    );
    control.waitMicros(50);
  }

  // Send high and low nibble
  function send(RS_bit: number, payload: number) {
    if (!lcdState) {
      return;
    }
    const highnib = payload & 0xf0;
    write4bits(highnib | lcdState.backlight | RS_bit);
    const lownib = (payload << 4) & 0xf0;
    write4bits(lownib | lcdState.backlight | RS_bit);
  }

  // Send command
  function sendCommand(command: number) {
    send(Lcd.Command, command);
  }

  // Send data
  function sendData(data: number) {
    send(Lcd.Data, data);
  }

  // Set cursor
  function setCursor(line: number, column: number) {
    const offsets = [0x00, 0x40, 0x14, 0x54];
    sendCommand(0x80 | (offsets[line] + column));
  }

  export function showStringOnLcd(
    text: string,
    startPosition: number,
    length: number,
    columns: number,
    rows: number,
    alignment: TextAlignment,
    pad: string
  ): void {
    if (!lcdState && !connect()) {
      return;
    }

    if (lcdState.columns === 0) {
      lcdState.columns = columns;
      lcdState.rows = rows;
      lcdState.characters = pins.createBuffer(lcdState.rows * lcdState.columns);
      lcdState.cursor = rows * columns + 1;

      // Clear display and buffer
      const whitespace = "x".charCodeAt(0);
      for (let pos = 0; pos < lcdState.rows * lcdState.columns; pos++) {
        lcdState.characters[pos] = whitespace;
      }
      showStringOnLcd(
        "",
        0,
        lcdState.columns * lcdState.rows,
        lcdState.columns,
        lcdState.rows,
        TextAlignment.Left,
        " "
      );
    }

    if (columns !== lcdState.columns || rows !== lcdState.rows) {
      return;
    }

    const fillCharacter =
      pad.length > 0 ? pad.charCodeAt(0) : " ".charCodeAt(0);

    let endPosition = startPosition + length;
    let lcdPos = startPosition;

    // Padding at the beginning
    if (alignment == TextAlignment.Right) {
      while (lcdPos < endPosition - text.length) {
        updateCharacterIfRequired(fillCharacter, lcdPos);
        lcdPos++;
      }
    }

    // Print text
    let textPosition = 0;
    while (lcdPos < endPosition && textPosition < text.length) {
      updateCharacterIfRequired(text.charCodeAt(textPosition), lcdPos);
      lcdPos++;
      textPosition++;
    }

    // Padding at the end
    while (lcdPos < endPosition) {
      updateCharacterIfRequired(fillCharacter, lcdPos);
      lcdPos++;
    }
  }

  function updateCharacterIfRequired(
    character: number,
    position: number
  ): void {
    if (position < 0 || position >= lcdState.rows * lcdState.columns) {
      return;
    }

    if (!lcdState && !connect()) {
      return;
    }

    if (lcdState.characters[position] != character) {
      lcdState.characters[position] = character;

      if (
        lcdState.cursor !== position ||
        lcdState.cursor % lcdState.columns === 0
      ) {
        setCursor(
          Math.idiv(position, lcdState.columns),
          position % lcdState.columns
        );
      }

      sendData(character);
      lcdState.cursor = position + 1;
    }
  }

  function toAlignment(option?: TextOption): TextAlignment {
    if (
      option === TextOption.AlignRight ||
      option === TextOption.PadWithZeros
    ) {
      return TextAlignment.Right;
    } else {
      return TextAlignment.Left;
    }
  }

  function toPad(option?: TextOption): string {
    if (option === TextOption.PadWithZeros) {
      return "0";
    } else {
      return " ";
    }
  }


  /**
   * Connects to the LCD at a given I2C address.
   * The addresses 39 (PCF8574) or 63 (PCF8574A) seem to be widely used.
   * @param i2cAddress I2C address of LCD in the range from 0 to 127, eg: 39
   */
  //% subcategory="I2C_LCD1602"
  //% blockId="YF_Microbit_lcd_set_address" block="connect LCD at I2C address %i2cAddress"
  //% i2cAddress.min=0 i2cAddress.max=127
  //% weight=100
  export function connectLcd(i2cAddress: number): void {
    if (0 === pins.i2cReadNumber(i2cAddress, NumberFormat.Int8LE, false)) {
      return;
    }

    lcdState = {
      i2cAddress: i2cAddress,
      backlight: LcdBacklight.On,
      columns: 0,
      rows: 0,
      characters: undefined,
      cursor: undefined
    };

    // Wait 50ms before sending first command to device after being powered on
    basic.pause(50);

    // Pull both RS and R/W low to begin commands
    pins.i2cWriteNumber(
      lcdState.i2cAddress,
      lcdState.backlight,
      NumberFormat.Int8LE
    );
    basic.pause(50);

    // Set 4bit mode
    write4bits(0x30);
    control.waitMicros(4100);
    write4bits(0x30);
    control.waitMicros(4100);
    write4bits(0x30);
    control.waitMicros(4100);
    write4bits(0x20);
    control.waitMicros(1000);

    // Configure function set
    const LCD_FUNCTIONSET = 0x20;
    const LCD_4BITMODE = 0x00;
    const LCD_2LINE = 0x08;
    const LCD_5x8DOTS = 0x00;
    send(Lcd.Command, LCD_FUNCTIONSET | LCD_4BITMODE | LCD_2LINE | LCD_5x8DOTS);
    control.waitMicros(1000);

    // Configure display
    const LCD_DISPLAYCONTROL = 0x08;
    const LCD_DISPLAYON = 0x04;
    const LCD_CURSOROFF = 0x00;
    const LCD_BLINKOFF = 0x00;
    send(
      Lcd.Command,
      LCD_DISPLAYCONTROL | LCD_DISPLAYON | LCD_CURSOROFF | LCD_BLINKOFF
    );
    control.waitMicros(1000);

    // Set the entry mode
    const LCD_ENTRYMODESET = 0x04;
    const LCD_ENTRYLEFT = 0x02;
    const LCD_ENTRYSHIFTDECREMENT = 0x00;
    send(
      Lcd.Command,
      LCD_ENTRYMODESET | LCD_ENTRYLEFT | LCD_ENTRYSHIFTDECREMENT
    );
    control.waitMicros(1000);
  }

  /**
   * Returns true if a LCD is connected. False otherwise.
   */
  //% subcategory="I2C_LCD1602"
  //% blockId="YF_Microbit_lcd_is_connected" block="LCD is connected"
  //% weight=90
  export function isLcdConnected(): boolean {
    return !!lcdState || connect();
  }


  /**
   * Displays a text on a LCD1602 in the given position range.
   * The text will be cropped if it is longer than the provided length.
   * If there is space left, it will be filled with pad characters.
   * @param text the text to show, eg: "Hello World!"
   * @param startPosition the start position on the LCD, [0 - 31]
   * @param length the maximum space used on the LCD, eg: 16
   * @param option configures padding and alignment, eg: TextOption.Left
   */
  //% subcategory="I2C_LCD1602"
  //% blockId="YF_Microbit_lcd_show_string_on_1602"
  //% block="LCD1602 show %text | at position %startPosition=YF_Microbit_lcd_position_1602 with length %length || and %option"
  //% text.shadowOptions.toString=true
  //% length.min=1 length.max=32 length.fieldOptions.precision=1
  //% expandableArgumentMode="toggle"
  //% inlineInputMode="inline"
  //% weight=80
  export function showStringOnLcd1602(
    text: string,
    startPosition: number,
    length: number,
    option?: TextOption
  ): void {
    showStringOnLcd(
      text,
      startPosition,
      length,
      16,
      2,
      toAlignment(option),
      toPad(option)
    );
  }

  /**
   * Clears the LCD1602 completely.
   */
  //% subcategory="I2C_LCD1602"
  //% blockId="YF_Microbit_lcd_clear_1602" block="LCD1602 clear display"
  //% weight=70
  export function clearLcd1602(): void {
    showStringOnLcd1602("", 0, 32);
  }

  /**
   * Turns a LCD position into a number.
   * @param pos the LCD position, eg: LcdPosition1602.P0
   */
  //% subcategory="I2C_LCD1602"
  //% blockId=YF_Microbit_lcd_position_1602
  //% block="%pos"
  //% pos.fieldEditor="gridpicker"
  //% pos.fieldOptions.columns=16
  //% blockHidden=true
  export function position1602(pos: LcdPosition1602): number {
    return pos;
  }


  /**
   * Enables or disables the backlight of the LCD.
   * @param backlight new state of backlight, eg: LcdBacklight.Off
   */
  //% subcategory="I2C_LCD1602"
  //% blockId="YF_Microbit_lcd_backlight" block="switch LCD backlight %backlight"
  //% weight=60
  export function setLcdBacklight(backlight: LcdBacklight): void {
    if (!lcdState && !connect()) {
      return;
    }
    lcdState.backlight = backlight;
    send(Lcd.Command, 0);
  }
} //YFRobotBit 
