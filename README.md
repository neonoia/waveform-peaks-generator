# Waveform Peaks Generator
Generate peaks data using [audiowaveform](https://github.com/bbc/audiowaveform).

### Parameter
**url** -  URL to the audio file that will be used for generating waveform peaks data

### Example Request

`POST /waveform/`

    curl --header "Content-Type: application/json" --request POST --data '{"url":"https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_5MG.mp3"}' http://localhost:5005/waveform
