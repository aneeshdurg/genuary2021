import random

def move():
    return random.choice([
        'up', 'down', 'left', 'right',
        'upright', 'upleft', 'downright', 'downleft'
    ])

def shape():
    return [
        random.choice(['small', 'medium', 'large']),
        random.choice(['red', 'green', 'blue']),
        random.choice(['square', 'circle', 'triangle']),
    ]

# Draw a dot with the most recently used color in every cell travelled to
# Starting color is blue
# End when asked to draw a triangle
while True:
    print(random.choice([move, shape])())
    input()
