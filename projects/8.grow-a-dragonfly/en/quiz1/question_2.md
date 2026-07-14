
--- question ---
---
legend: Question 2 of 3
---

You wrote code to make the dragonfly move only if it is `not`{:class="block3operators"} `touching`{:class="block3sensing"} the mouse-pointer.

Where would you put a `start sound`{:class="block3sound"} block to make the dragonfly start a sound each time it moves?

--- choices ---

- ( ) 

```blocks3
when flag clicked
forever
+start sound [Wings v]
if <not <touching [mouse-pointer v] ?> > then
point towards (mouse-pointer v)
move [5] steps
end
end
```

--- feedback ---

No, with this code the `start sound`{:class="block3sound"} block is outside the `if`{:class="block3control"} block, so it will run every time the `forever`{:class="block3control"} loop runs, even if the dragonfly doesn't move.

--- /feedback ---

- (x) 

```blocks3
when flag clicked
forever
if <not <touching [mouse-pointer v] ?> > then
+start sound [Wings v]
point towards (mouse-pointer v)
move [5] steps
end
end
```

  --- feedback ---

Yes, that's correct. Placing the `start sound`{:class="block3sound"} block inside the `if`{:class="block3control"} block means it will play when the dragonfly moves.

  --- /feedback ---

- ( ) 


```blocks3
when flag clicked
forever
if <not <touching [mouse-pointer v] ?> > then
point towards (mouse-pointer v)
move [5] steps
end
+start sound [Wings v]
end
```

  --- feedback ---
  
No, the `start sound`{:class="block3sound"} block is outside the `if`{:class="block3control"} block, so it will run every time the `forever`{:class="block3control"} loop runs, even if the dragonfly doesn't move.

  --- /feedback ---

--- /choices ---

--- /question ---
