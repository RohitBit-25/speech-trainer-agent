import mediapipe as mp
try:
    print(f"mp dir: {dir(mp)}")
    print(f"solutions: {mp.solutions}")
    print("Success")
except AttributeError as e:
    print(f"Error: {e}")
    try:
        from mediapipe.python import solutions
        print("Imported mediapipe.python.solutions")
        print(f"solutions: {mp.solutions}")
    except Exception as e2:
        print(f"Retry Error: {e2}")
        try:
            import mediapipe.tasks.python.vision
            print("Imported mp.tasks.python.vision")
            print(mp.tasks.vision)
        except Exception as e3:
            print(f"Tasks Error: {e3}")
