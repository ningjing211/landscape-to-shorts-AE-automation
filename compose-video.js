const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 設定輸入檔案路徑
const BACKGROUND_IMAGE = './13_portrait.jpg';  // 背景圖片
const OVERLAY_VIDEO = './template.mov';    // 前景影片
const AUDIO_FILE = './01.mp3';            // 音訊檔案
const OUTPUT_PATH = './output.mov';       // 輸出影片

// 確保所有輸入檔案都存在
function checkFiles() {
    const files = [BACKGROUND_IMAGE, OVERLAY_VIDEO, AUDIO_FILE];
    const missing = files.filter(f => !fs.existsSync(f));
    if (missing.length > 0) {
        console.error('找不到以下檔案：', missing.join(', '));
        process.exit(1);
    }
}

// 主要處理函數
async function processVideo() {
    try {
        // 檢查檔案是否存在
        checkFiles();

        // 合成影片
        console.log('開始合成影片...');
        const ffmpegCmd = `ffmpeg `
            + `-loop 1 -i "${BACKGROUND_IMAGE}" `               // 背景圖片（循環）
            + `-i "${OVERLAY_VIDEO}" `                         // 前景影片
            + `-i "${AUDIO_FILE}" `                           // 音訊
            + `-filter_complex "`
            + `[0:v]scale=1080:1920,setsar=1:1[bg];`         // 確保背景圖片尺寸正確
            + `[bg][1:v]overlay=0:0:format=auto:shortest=1[v]`  // 疊加效果
            + `" `
            + `-map "[v]" `                                   // 使用合成後的視訊
            + `-map 2:a `                                     // 使用音訊
            + `-c:v libx264 -pix_fmt yuv420p `               // 視訊編碼設定
            + `-c:a aac `                                    // 音訊編碼
            + `-shortest `                                   // 使用最短串流長度
            + `"${OUTPUT_PATH}" -y`;                         // 輸出檔案

        console.log('使用的檔案：');
        console.log('- 背景圖片:', BACKGROUND_IMAGE);
        console.log('- 前景影片:', OVERLAY_VIDEO);
        console.log('- 音訊檔案:', AUDIO_FILE);
        console.log('\n執行合成...');
        
        execSync(ffmpegCmd, { stdio: 'inherit' });
        console.log('\n處理完成！輸出檔案:', OUTPUT_PATH);

    } catch (error) {
        console.error('處理時發生錯誤:', error);
        if (error.stderr) {
            console.error('FFmpeg 錯誤輸出:', error.stderr.toString());
        }
    }
}

// 執行程式
processVideo(); 