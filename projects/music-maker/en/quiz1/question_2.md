
--- question ---

---
legend: Question 2 of 3
---

Here is a `my blocks`{:class='block3myblocks'} definition.

```blocks3
define play note: (note) beats (beats) rest (rest)
play note (note) for (beats) beats
rest for (rest) beats
```

Which of the following blocks would play `middle C` for `0.25` beats and rest of `0.5` beats?

--- choices ---

- (x) 

```blocks3
play note: (60) beats (0.25) rest (0.5)::custom
```

  --- feedback ---

  Yes, the midi value '60' plays the note 'middle C' for 0.25 beats, and then the instrument rests for 0,5 beats.

  --- /feedback ---

- ( ) 
```blocks3
play note: (50) beats (0.25) rest (0.25)::custom
```

  --- feedback ---

  The length of the note here is correct, however double check what note the number '50' plays, and make sure you have rested for long enough.

  --- /feedback ---

- ( ) 
```blocks3
play note: (60) beats (0.25) rest (0.25)::custom
```

  --- feedback ---

The midi value '60' plays the note 'middle C' for 0.25 beats, and then the instrument rests for 0,25 beats. However, the rest time does not match the question.

  --- /feedback ---

- ( ) 
```blocks3
play note: (60) beats (0.5) rest (0.25)::custom
```

  --- feedback ---

  You have the right note (midi value '60') for 'Middle C' and the right amount of rest, however the instrument will play the note for too long.

  --- /feedback ---

--- /choices ---

--- /question ---
