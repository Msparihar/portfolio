# Deep-Speech-2

This repository contains the code and training materials for a speech-to-text model based on the Deep Speech 2 paper. The model is trained on a dataset of audio and text recordings and can be used to transcribe speech to text in real-time.

## Speech-to-Text Model

This repository contains the code and training materials for a speech-to-text model based on the Deep Speech 2 paper. The model is trained on a dataset of audio and text recordings and can be used to transcribe speech to text in real-time.

### Requirements

- Python ==  3.10
- TensorFlow <2.11 <!-- Note: TensorFlow 2.11 wouldn't work with GPU. 🤷‍♀️ -- >
- NumPy
- Pandas
- Matplotlib

### Setup

#### Step-1

`conda create -n stt python=3.10`

#### Step-2

`conda activate stt`

#### Step-3

`conda install -c conda-forge cudatoolkit=11.2 cudnn=8.1.0`

#### Step-4

`python -m pip install "tensorflow<2.11"`

#### Step-5: Check GPU availability

`python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"`

### Installation

To install the required dependencies, run the following command:

`pip install -r requirements.txt`

### Training the Model

To train the model, run the following command:

`python train.py`

This will train the model on the default dataset, which is located in the data directory. You can also specify your own dataset by passing the path to the dataset directory as an argument to the --train-dir flag.

### Using the Model
Once the model is trained, you can use it to transcribe speech to text by running the following command:

`python transcribe.py`

This will prompt you to record an audio clip. Once you have recorded the audio clip, the model will transcribe it to text and print the transcription to the console.

Deployment
The trained model can be deployed to production using a variety of methods, such as TensorFlow Serving or Docker.

Licensing
This repository is licensed under the MIT License.

### Checkpoints

Important Details to be filled in:

- The name of your speech-to-text model: audio-wizard.

- The dataset you used to train the model.[link](https://data.keithito.com/data/speech/LJSpeech-1.1.tar.bz2)

- The performance of the model on a held-out test set.

- Instructions for using the model.

- A link to the Deep Speech 2 paper: https://arxiv.org/abs/1512.02595.
