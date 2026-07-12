--- question ---
---
legend: Question 2 of 3
---

To make the rocket interactive, the **rocket** sprite has this script:

```blocks3
when flag clicked
set rotation style [all around v]
forever
point towards (mouse-pointer v)
end
```

Which **rocket** costume should we use so that the top of the rocket will point towards the mouse pointer?

--- choices ---

- ( ) ![A rocket pointing to the left-hand side.](images/rocket_left.png)

  --- feedback ---

If the rocket is pointing to the left-hand side, the rocket will be facing the opposite direction to (away from) the mouse pointer when it rotates.

  --- /feedback ---

- ( ) ![A rocket facing down.](images/rocket_down.png)

  --- feedback ---

If the rocket is facing down, it will be facing a different direction to the mouse pointer when it rotates.

  --- /feedback ---

- (x) ![A rocket pointing to the right-hand side.](images/rocket_right.png)

  --- feedback ---

If the rocket is pointing to the right-hand side, the rocket is in the default position for correctly pointing towards your mouse pointer if the rotation style is set to `all around`{:class="block3motion"}.

  --- /feedback ---

- ( ) ![A rocket facing up.](images/rocket_up.png)

  --- feedback ---

If the rocket is facing up, it will be facing a different direction to the mouse pointer when it rotates.

  --- /feedback ---
  
--- /choices ---

--- /question ---
