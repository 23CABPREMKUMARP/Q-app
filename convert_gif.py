import imageio
from PIL import Image
import numpy as np

try:
    reader = imageio.get_reader('public/upscaled-video.mp4')
    fps = reader.get_meta_data()['fps']
    # Output at half the FPS
    writer = imageio.get_writer('public/upscaled-video.gif', fps=fps/2)
    count = 0
    for frame in reader:
        count += 1
        # Skip every other frame
        if count % 2 == 0:
            continue
        img = Image.fromarray(frame)
        # Scale down significantly for performance
        img.thumbnail((350, 350))
        # Reduce colors to 64 to drastically reduce size
        img = img.convert('P', palette=Image.ADAPTIVE, colors=64).convert('RGB')
        writer.append_data(np.array(img))
    writer.close()
    print("Success")
except Exception as e:
    print("Error:", e)
