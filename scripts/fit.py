import numpy as np
from scipy.optimize import curve_fit

def l( x, a, b):
    return a*np.log(np.absolute(x)) + b

x = np.array([])
y = np.array([])


params = curve_fit(l, x, y)

print(params)