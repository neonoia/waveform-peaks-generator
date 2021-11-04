# Waveform Peaks Generator
Node server to generate waveform peaks using [audiowaveform](https://github.com/bbc/audiowaveform) given mp3 file.

### Parameter
**file** -  Audio file that will be used for generating waveform peaks data
**pixelPerSeconds** -  Generated peaks datapoint for each second

### Example Request

`POST /v1/waveform/`

    curl --verbose --request POST --header "Content-Type:multipart/form-data" --form "file=<example.mp3" --form "pixelPerSeconds=40"  http://127.0.0.1:5005
