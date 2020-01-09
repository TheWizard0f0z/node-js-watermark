const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const makeImageBrighter = async function(inputFile, outputFile) {
  const image = await Jimp.read(inputFile);

  image.brightness(0.1).write(outputFile);

  async function succes() {
    await image.writeAsync(outputFile);
    console.log('File has been successfully edited!');
  }
  succes();
};

const increaseContrast = async function(inputFile, outputFile) {
  const image = await Jimp.read(inputFile);

  image.contrast(0.1).write(outputFile);

  async function succes() {
    await image.writeAsync(outputFile);
    console.log('File has been successfully edited!');
  }
  succes();
};

const makeImageGreyscale = async function(inputFile, outputFile) {
  const image = await Jimp.read(inputFile);

  image.greyscale().write(outputFile);

  async function succes() {
    await image.writeAsync(outputFile);
    console.log('File has been successfully edited!');
  }
  succes();
};

const invertImage = async function(inputFile, outputFile) {
  const image = await Jimp.read(inputFile);

  image.invert().write(outputFile);

  async function succes() {
    await image.writeAsync(outputFile);
    console.log('File has been successfully edited!');
  }
  succes();
};

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const textData = {
    text,
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  };

  image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
  image.quality(100).write(outputFile);

  async function succes() {
    await image.writeAsync(outputFile);
    console.log('File has been successfully generated! Check `/img` folder');
  }

  async function restartApp() {
    await succes();
    startApp();
  }
  restartApp();
};

const addImageWatermarkToImage = async function(
  inputFile,
  outputFile,
  watermarkFile
) {
  const image = await Jimp.read(inputFile);
  const watermark = await Jimp.read(watermarkFile);
  const x = image.getWidth() / 2 - watermark.getWidth() / 2;
  const y = image.getHeight() / 2 - watermark.getHeight() / 2;

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 0.5
  });
  image.quality(100).write(outputFile);

  async function succes() {
    await image.writeAsync(outputFile);
    console.log('File has been successfully generated! Check `/img` folder');
  }

  async function restartApp() {
    await succes();
    startApp();
  }
  restartApp();
};

/*
const prepareOutputEditedFilename = filename => {
  const [name, ext] = filename.split('.');
  return `${name}-edited.${ext}`;
};
*/

const prepareOutputFilename = filename => {
  const [name, ext] = filename.split('.');
  return `${name}-with-watermark.${ext}`;
};

const startApp = async () => {
  // Ask if user is ready
  const answer = await inquirer.prompt([
    {
      name: 'start',
      message:
        'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm'
    }
  ]);

  // if answer is no, just quit the app
  if (!answer.start) process.exit();

  // ask about input file and editing option
  const options = await inquirer.prompt([
    {
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg'
    },
    {
      name: 'editImage',
      message: 'Do you want to edit the selected file?',
      type: 'confirm'
    }
  ]);

  // unedited file
  const uneditedImage = options.inputImage;

  // already edited file
  const editedImage = prepareOutputFilename(options.inputImage);

  // flag if the file is being edited
  let edited = false;

  // choosing file editing options
  if (options.editImage) {
    const editChoices = await inquirer.prompt([
      {
        name: 'choicesList',
        type: 'list',
        choices: [
          'Make image brighter',
          'Increase contrast',
          'Make image b&w',
          'Invert image'
        ]
      }
    ]);

    if (editChoices.choicesList === 'Make image brighter') {
      makeImageBrighter('./img/' + uneditedImage, './img/' + editedImage);
    } else if (editChoices.choicesList === 'Increase contrast') {
      increaseContrast('./img/' + uneditedImage, './img/' + editedImage);
    } else if (editChoices.choicesList === 'Make image b&w') {
      makeImageGreyscale('./img/' + uneditedImage, './img/' + editedImage);
    } else if (editChoices.choicesList === 'Invert image') {
      invertImage('./img/' + uneditedImage, './img/' + editedImage);
    }
  }

  // ask about watermark type
  const options2 = await inquirer.prompt([
    {
      name: 'watermarkType',
      type: 'list',
      choices: ['Text watermark', 'Image watermark']
    }
  ]);

  // ask about watermark text/watermark image and paste it into the file
  if (options2.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([
      {
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:'
      }
    ]);
    options.watermarkText = text.value;
    const imagePath = edited ? editedImage : uneditedImage;
    try {
      if (fs.existsSync('./img/' + imagePath)) {
        addTextWatermarkToImage(
          './img/' + imagePath,
          './img/' + prepareOutputFilename(imagePath),
          options.watermarkText
        );
      } else {
        console.log('Something went wrong... Try again');
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    const image = await inquirer.prompt([
      {
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: 'watermark.png'
      }
    ]);
    options.watermarkImage = image.filename;
    const imagePath = edited ? editedImage : uneditedImage;
    try {
      if (
        fs.existsSync('./img/' + imagePath) &&
        fs.existsSync('./img/' + options.watermarkImage)
      ) {
        addImageWatermarkToImage(
          './img/' + imagePath,
          './img/' + prepareOutputFilename(imagePath),
          './img/' + options.watermarkImage
        );
      } else {
        console.log('Something went wrong... Try again');
      }
    } catch (err) {
      console.error(err);
    }
  }
};

startApp();
