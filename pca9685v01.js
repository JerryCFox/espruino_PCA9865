//Initial Porting by FyberChris: http://forum.espruino.com/profiles/1310/

//Sources:
//https://github.com/technicalmachine/servo-pca9685
//https://github.com/adafruit/Adafruit-PWM-Servo-Driver-Library
//TODO:
//Add additional modes and functions, ie.
//such as from https://github.com/arc12/PCA9685/
var Constants = {
    PCA9685_SUBADR1 : 0x02,
    PCA9685_SUBADR2 : 0x03,
    PCA9685_SUBADR3 : 0x04,
    MAX : 4096,
    PCA9685_MODE1 : 0x00,
    PCA9685_MODE2 : 0x01,
    PCA9685_PRESCALE : 0xFE,
    /* MODE1 bits */
    PCA9685_RESTART : 0x80, //!< Restart logic. Default disabled. Not used.
    PCA9685_EXTCLK : 0x40, //!< External clock. Default disabled. Not used.
    PCA9685_AI : 0x20, //!< Register auto-increment. Enabled by initialise()
    PCA9685_SLEEP : 0x10, //!< Sleep (osc off). Device is sleeping on POR, brought out of sleep by initialise()
    PCA9685_SUB1 : 0x08,//!< Sub-address 1 enable. Default disabled. Not used.
    PCA9685_SUB2 : 0x04, //!< Sub-address 2 enable. Default disabled. Not used.
    PCA9685_SUB3 : 0x02, //!< Sub-address 3 enable. Default disabled. Not used.
    PCA9685_ALLCALL : 0x01, //!< Respond to all-call. Default enabled. Not used.
    /* MODE2 bits. These are not actually used at present */
    PCA9685_INVRT : 0x10,
    PCA9685_OCH : 0x08,
    PCA9685_OUTDRV : 0x04,
    PCA9685_OUTNE1 : 0x02,
    PCA9685_OUTNE0 : 0x01,
    // I2C Address for "all call" (7 bit form)
    PCA9685_ALLCALLADR : 0x70, //!< 0xE0 default "all call" I2C write address (7bit => 0x70)
    LED0_ON_L : 0x06,
    LED0_ON_H : 0x07,
    LED0_OFF_L : 0x08,
    LED0_OFF_H : 0x09,
    ALLLED_ON_L : 0xFA,
    ALLLED_ON_H : 0xFB,
    ALLLED_OFF_L : 0xFC,
    ALLLED_OFF_H : 0xFD
};

exports.connect = function(_i2c,freq) {
    return new PCA9685(_i2c,freq);
};

function PCA9685(i2c, freq, address) {
  this.i2c = i2c;
  freq = 50;
  this.add = 0x40;
  this.setPWMFreq(freq);
  //this.resetPCA9685();
}

PCA9685.prototype.resetPCA9685 = function() {
  this.i2c.writeTo(this.add, [Constants.PCA9685_MODE1, 0x0]);
};
PCA9685.prototype.setPWMFreq = function(freq) {
  var prescaleval = (25000000/Constants.MAX)/freq - 1;
  var prescale = Math.floor(prescaleval);
  
  var oldmode = this.i2c.readFrom(this.add, Constants.PCA9685_MODE1) | 0x10;
  var newmode = (oldmode & 0x7F) | 0x10; // sleep
  this.i2c.writeTo(this.add, [Constants.PCA9685_MODE1, newmode]); // go to sleep
  this.i2c.writeTo(this.add, [Constants.PCA9685_PRESCALE, prescale]); // set the prescaler
  this.i2c.writeTo(this.add, [Constants.PCA9685_MODE1, oldmode]);
  this.i2c.writeTo(this.add, [Constants.PCA9685_MODE1, 0x0]);
};

PCA9685.prototype.setPWM = function(num, on, off) {
  if (num < 1 || num > 16) {
    throw "Servos are 1-indexed. Servos can be between 1-16.";
  }
  this.i2c.writeTo(this.add, [Constants.LED0_ON_L + (num-1)*4, on]);
  this.i2c.writeTo(this.add, [Constants.LED0_ON_H + (num-1)*4, on >> 8]);
  this.i2c.writeTo(this.add, [Constants.LED0_OFF_L + (num-1)*4, off]);
  this.i2c.writeTo(this.add, [Constants.LED0_OFF_H + (num-1)*4, off >> 8]);
};
// 0...180
PCA9685.prototype.moveServo = function (num, val) {
  if (num < 1 || num > 16) {
    throw "Servos are 1-indexed. Servos can be between 1-16.";
  }
  console.log(0,Math.floor((Constants.MAX)-(Constants.MAX)*(val/180)));
  this.setPWM(num,0, Math.floor(Constants.MAX-(Constants.MAX)*(val/180)));
};
//I2C1.setup({scl:B8, sda:B9});
//var driver = connect(I2C1, 50);
//driver.setPWM(1,400,20);
