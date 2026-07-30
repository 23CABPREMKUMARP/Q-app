import imageio
from PIL import Image
import numpy as np

try:
    reader = imageio.get_reader('public/upscaled-video.mp4')
    fps = reader.get_meta_data()['fps']
    writer = imageio.get_writer('public/upscaled-video.gif', fps=fps)
    for frame in reader:
        img = Image.fromarray(frame)
        img.thumbnail((600, 600))
        writer.append_data(np.array(img))
    writer.close()
    print("Success")
except Exception as e:
    print("Error:", e)
