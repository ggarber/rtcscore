import numpy as np
from scipy.optimize import curve_fit

def l( x, a, b, c ):
    return a*np.log(np.absolute(b*x+c)) + c

x = np.array([])
y = np.array([])


params = curve_fit(l, x, y)

print(params)