import math
import numpy as np

def calculate_a_mag(ax: float, ay: float, az: float) -> float:
    """
    Calculates the orientation-invariant total acceleration magnitude.
    A_mag = sqrt(ax^2 + ay^2 + az^2)
    """
    return math.sqrt(ax * ax + ay * ay + az * az)

def preprocess_window(window_data: list) -> np.ndarray:
    """
    Transforms a list of raw telemetry packet amag readings into a normalized numpy array
    suitable for LSTM Autoencoder input shape (1, 150, 1).
    """
    # Extract amag list
    amags = [packet.amag for packet in window_data]
    
    # Ensure exact length of 150 (3 seconds at 50Hz)
    if len(amags) < 150:
        # Pad with the last value if slightly short
        last_val = amags[-1] if amags else 9.8
        amags += [last_val] * (150 - len(amags))
    elif len(amags) > 150:
        # Truncate to 150
        amags = amags[:150]
        
    # Reshape for LSTM: (batch_size=1, timesteps=150, features=1)
    arr = np.array(amags, dtype=np.float32).reshape(1, 150, 1)
    return arr
