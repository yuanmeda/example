(function (ko,$) {
'use strict';

ko = 'default' in ko ? ko['default'] : ko;
$ = 'default' in $ ? $['default'] : $;

var img = 'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMvaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjUtYzAyMSA3OS4xNTU3NzIsIDIwMTQvMDEvMTMtMTk6NDQ6MDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE0IChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4QTdFRDhDNzNBMEQxMUU3OUU0NEM4QUE0REU1OURGRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo4QTdFRDhDODNBMEQxMUU3OUU0NEM4QUE0REU1OURGRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjhBN0VEOEM1M0EwRDExRTc5RTQ0QzhBQTRERTU5REZEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjhBN0VEOEM2M0EwRDExRTc5RTQ0QzhBQTRERTU5REZEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJ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hUSYUZoRJhUSYBKVEpUQEpUQAEoEUBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVaQUAFpBRVpBYgVYhFaiBViEGohFWIFWIQWIRWqFWIQWhVpAoVaBaQKFWgAAAWkChSgAAUAAAAAAAAAAAAAEAoCgKBKEFAAEoChEpQoEoRKUShEpRJgRJhRmhEmFRmYVEmASYVGZhUSgSlRKBFQBKBFAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFWkFABYhFWIBaRViAaiEVYhFaiBViEGohFWIRWqFWIQWhVpBaFKQWhVAABaQKFAUAAAAAAAAAAAAAAAAAAAAAAAAEAoCgRUAASgKESlEoEpUSgSlRJgRmYVEmFGZgRJhUZmFRJhRmhEmFRARUASgRQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABVRFFAWkVYgGohFWIRViAaiEVqIRViEVqIFWIRWohBaFWkFoVaQKFUAFpAoUBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASgKBFQAoEoRKUSgSlRJgRJhRmYESYVGZhUZmFRJhRmYESYVEmFRkEVAEBFAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFWEFABUVYgGohFWIRWogVqIQWIRWohFaiEVYgVYhFapBaFWkChVABaRQFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAKBBBQoEoRKUShEmFGZgRJhUZmFEmFRmYVGZgRJhUZmFRJhUZBFQBJBFAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFWEFABUVYgGohFWIRWohFaiBWohFWIRWohBqIRViBVpFWgWkVQAWkUBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASgQQUSgKESlGZgRJhUSYUZmFRmYEZmFRJhUZmFRmYVEmFRkEVAEkEUBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFFVABYhFWIBqIRViEVqIRWohFaiBWohFaiEVYhFaiEFoVaQUUBaRQFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABKBFQBKBKVEmBEmFGZhUZmBGZhUSYVGZhUZmFRmYVEmFRkEVAEkEUBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFFEFBYRViAaiEVYhFaiEVqIRWohFaiBWohFaiEVYhBaFWkVQWkAVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQChEUKBmhEmFEmFRmYESYVGZhUZmFRmYVGZhUZmFRJhUZkEVAEBFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFWEFBYBYRVhFaiEVqIRWohFaiEVqIFaiEVqIRViEVaQaFAWkVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASgRUASYESYUZmFRmYESYVGZhUZmFRmYVGZhUZmFRmYVEkEVEBFAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABUVQAaRVhFaiAaiEZNRCK1EIrUQitRCK1EIqxCK1SCigKiqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACACIokwCTCozMKjMwIkwqMTCozMKjMwqMzCozKokqiSqICSCKAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKqCgsIrUAsQitRCK1EIrcQjJqIRWohFaiEVYhFaiEFFEFFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEABFRJgEmFRmYVGZgRmYVGZhUZmGSMzCozMKjMiMqiKgCKIIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACrCCgsAsIrUIrUQitRCK1EIrUQitRCMmohFaiEVqEFFEFFUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEmBEUSYBJhUZmFRmYVGZhUZmFRiYVizMKjMwqMyqJIIqJIIoCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArSACorUIrUQK1EIrUQxVuIRWohFaiEVqIRWcdmM7Jw9MLMdMkW64erFkR4gqKoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICKiTAjMwozMKjMwqMzCsWZhUYmFRmYVGZVElUZlUAQEVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVYQUFgFhFahFahFaiEVuIRk1EIrUQxVqIRVnwxmfKo8xXFjlMZxlfjfm3zDniXbt2Rjr6o9Pk0VjMt9pxDx4m3xnCfT4wz2R7WGu3sdPXj19F/mq6a8NueuGkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABzx3HgzzJ4cb8J5URc6eqOr1+TV51OXDMcvc2+RfhzxPH3uhtagAAAAAAEBBBRmRElUZmFRmYVGJhUZmGSMzCsWJVElUZkEVEkEUBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVUFBbhBnZv168byn3R6ZMLlxbOduy+GeiPZ5/eYTLy+dt8+vL75Uy9dXO5Gufi6o9WXikwsWl9Dj8/VtiqmM/TiwmrOLw6I36/anGV5w1HI1e1OErzhqORp/V+EpxllzhNu7XOuYxmJmfCitZylrRhzRjM+Tblqw6NueX7fGK6ZnwmPc11jq2Wno8dOU47MZiaZ2jowrPVZ2Zxu6/6rMdMLynOX0I8Yc7oAZzzjDGcp8oIjKTOHlo5HVhlOc+OPjPuZ2p1YVv06t6dsbML8pjzhLVwyrbMPRiyAAfqvo7Z/627lwY+bzNe3nRF8jVydmXHnGfTGOMzhGUR64mXzV/U9uy8xq8PhGZe12OvtLU/qmJt7czh3fU/0T9LZ9s/caebv4PG2Z44Tu4uyM/Cf05zjsmPe1be+7y1eFIzf7J/J317LtKTGy0/0fbH5vw0cfDj/AP0YcjLlYa5nHDkbIjHLPGJ8JyiPTT6LtfM8qvmfrx1fPd1NJ2W4foz0V0OcAB39m7Lzu78v9txMY6ojqzzymsccfXMtHcdxXVXlZ0dv21t1uNX6fL/1hyvl3jz8J2fpnXMR99z/AAeXHrNc/p+96k+iWx+qPsfg/qb6K/8AYnau948rtnGjufEzwjDdxo3YY68Yib6sIzy1z1T66bf/AHO2icWtxn5T+WWev0fZNJiYjx8Ye3j6YqfTH/J6sPBmBUZ2bMdeGWeXhjjFyQTJGzCdcbIn8kx1X7Ay5uHzo5GzZjPhU3h/lZWrhjW2XWxZAAAAAAAAAAAAAAAAAAAAM5bNePxZRj75iDBl55c3h4/Fv1x788f8V4ynKHnPc+3x58jX9mUT/BeMpzj3sz3jtkf/ANGP4z/I4Sc4Znvfa4/14/8Axy/wOEp5lU/vvav9/wD7c/8ABfLk8yp/fe1f7/8A25/4HlyeZU/vvav9/wD7c/8AA8uTzKv6b9NfQPC3cLTze5zlsy34xsw48TOEY45RcdVVlde6nz3eeqWi01p7Pa+j7P0qs1i2z2+x97L6K+mJx6f2OMR64z2RP39Tg/8AR3/5fg759N0f4/i/nv1J2v8A9ddo5PL4scPTh3fXn83DbnOUbIzz/NGfzMpuqm68mvsew7vbvjdM/wBHLP2fD4sO+77t9WmdMfq44x8/i/P48viZfDu1z7son+b7LEvkuUPXHPDL4con3TaKoAAAAAAICKiSCSqMyqMzCozMKjEwrFmVRiVRmVRJVGZVAEUQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFTLKMMZynyhEfP2bMtmU5ZfcKwAAC45TjMTE1MeUg+no2xt1xl6fLKPaivQAFARSYiVRJqIBnqlcJl06uXnjhEVExDVbW212Th6xzcPTjMe7xY+WzjazyORqz11F3a0pMSxveJhzRLY1vfiZdO2pmurwYXjoz1z1drS3gAPD6X+i+1cr6njLfyc8MenPfq4uEVOU4zHVeceWMdXq9lvj/WO2t2kxu1T/AHfZ/wAw9D0n0/Xv2zF5nERnH8309f1Pye18XuHY+5dq5uzh7Nl4bONPH2TcVMZxjOzHLx6cZelMX7mNfc6Jjw6xPhPw9/Tq7K8NHPt9vh8PGPy9z4HB+o+3dw5U6eHr5OeETOM7s9OWOGMxF9OeUTljjl7Le1rtMx/VGJ+15W3VFZ6TmH02xoAAZnm9w4O3Dk8Lfs0bMfCcteU4/fXnHvfO/wCwarzWt6+Fc5+r7n/S9uibbNOyI5XxMZ9uM5j59X6XhfXP1jjwsedvnHPixl0Rs2a8YxymIv8Ap6Z9HocnpXk9xE67f9kfHxhl/suq/ZbYtqmJ12/t/wAZ/n7H0fq3ue7uPbuB3bt23bHH36Zx5GGMzGMRlU/mr23jLd6fGjz7atkV8ys9Mx7vd+Lx/UL7baa7aTPC0dcfn+D8W+nfOAPm9425RGGqPhn80+1nSGu8ufDkZR2/PXlddVYVP2zE+xljqmejz4GeOPK1zlMxF1ce31lvBK+L7s5Y4xeUxER5zLU3M4b9Oyawzxyn1RMSYMuPl9zjVlOvVEZZR8WU+USzirC18PHV3fbGUfNxicfTOPhMLNEi76mOWOWMZYzeMxcS1tigAAAAAAAkzERczUeuQc+3uXA1/Hvw90T1T90WyissZvDl2fUPb8fh69n+XGv40sa5YzthzbPqfH/T48z7csq/CIZeUxnc58/qTmz8GGvH7Jmf4svKhPNlz5987nl/rdMerHHGP5L5cMfMl459x7hn58jZ9mUx/BeMJzn3vHLbuz+PPLL3zMrhjlilCgKAoCgKAoCgf0/tP1BzN/Axz4nM26sM8enLDXsyjpmqmKvwmH82eoR3vpXd21za0cbZjOeNo9k48Jif5P23stnb9/28XiI6x1x41n2x8Hxe9bPrL6Y5nF7pl3HlbOPtyjZry3btmUXE38vdEzU3H3w/Zv8AXvUNfqHbY20rTbjrER/9R7vyfnHrHa7ey35pe19eekzP3T/HV3/WXdfo/wCr9XE7nq71wO3dyw1dO3RyNuOFx59GU3d4ZXU14sey7nue02WpfXa+vPSa9fr9W7ve2095St6Xil8dYt+H0fg+78Tjds08fdn3Dh8rHlTWvHibsd+Uf5scLmI9r6DtfUabrTEVvXH+VZh4e/03ZriJmazn3S56d7z3pju34/Dsyx90zCYMy9cO49wx8uRs+3KZ/inGGXOXth3zumP+t1R6pxx/wTy4XzJe+H1Jzo+LDXl9kxP4SnlQvmy6MPqef9Tj/bjl/KYY+Uy850a/qPg5fFjnhPuiY/CU8qWUbYdOvvHbc/LfEf5onH+MMeEsovDo17tOz/x7Mc/8sxP8EwuW5RUVEkRmVGZVGZhWLEqjMwqMzDJixKozKokgiokgigIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACubm5+GOHr8ZQcgAAAAPbjb41ZT1fDMeUesHrlz8/6cYiPb4hkx7hnf5sYmPZ4Jgy6dXJ1bI8JqfVPmLDfzMPWmVwnzcDJhPnY+qTJhPnR+kyYPnf8ASmVwnzsvVBkwk7cp9S5TCdeXsMnFcd23GbxmphJ6rHR6/v8Alfqj7oYcIZ85P3/K/XH3QcIOcvoY8/R27tP9y51bfmTl8rDLwwxx1/Fll0xc+5z3ibW4x0iPF1a+lYtMZm3hDr7X9V8PlfTHK5nbPlcXuEzGXK6eqco42OX5Z/NERj1Xc08jd6f53cxO3NtVa/0+7lOXrR3M6u3mNf8ATsmevy6Pj8zufL+pO9xxu27cuNxt3Rjv5FRGWNYR146/b4T+b+fl0+m9pPa9tFLdePL77Thz99ujf3HKP7sdPpGXvwu4fT/A2z2njcPLHiavzYb/AJkzsyjLKerOMZj9Xodsar+Oevuclt1PdmPencsuXw+Zs0fN68canDOo8ccouJ8m7VMWrlzbomlsZc37/lfrj7oZ8Ia+cr+/5X6o+6DhBzl1Rr73Or5scbPLXV3GuZuPZEeMtVr64zmYb6U29JiJfsuTxtnJ+k8Owd5zjHuWzROzPXx88sMteGGd6vz4z8WP5cZrwnx9D832bp19x+50RMavM45+fj9vX5Puorz0+Tunlt4Zn6e3+PF/KNnJ7n2bj3wO89x1bc5mONxsd+WeOeyfKPl5XjlHrfoXcdhp2db1i0/f9vi+O7bvttelZxX7n1u36/rDdjh3XuuzkbstuF56Z04a8MYmPC4wwwm49fgdvq1a68az9+fxTutl7zNpr9cf8OqO6ZenXH3/APB1cHF5jj5WXz9s7K6bjyu2URhhM5eXRnGM4xPhPjMe5cJldeOzXnjnjMRljNwTBEvbm8jZyM4rw1x5Y+30sa1wytbLmxjZjlGWNxlHlMMmOUnHL0xIJU+oHXx+5btOGOFRlhj6J8/vYzXLOL4fW0bsN2qNmHlPo9UtUxhticvQAAGNu/Tqi9ueOEf9UxBEZJmIcO7vvA1+GM5bJ/6Y8Pvmmca5a52w4t31Htnw06Yx9uU3+EUzjUwna49vd+47PPbOMerCIx/GPFlFIYzslyZ57dk3szyzn15TM/xZ4YZYoCgKAoCgKAoCgKAoCgKAoCgKB7cblcri7I3cbZnr24zE4zhdzMeMeEefucvd9po30xurW9Y/yiJx8fh83R2vcbdVs6rTW0+6X9f7pp0d37Dwe0fUmnTl3TlaI37+NHjGGzHHpyyx9uM5/wAafllr30Xtv0Z8ut8Z+/E/PD9HxXZWNW3HmWrn+f3v4hz+Hwe3RsjPja/ma8p1xhjhjeWcTUYx4et+r0vW1IvHhMZj6vznGznNJmenj9H0uy/SvE7Zx8d3fOXjxN/Nj5mjjasZz3ThER4THljEehprsnMxWMundStoibTiPd7fn9X0OR2LjbOLs5fa+V+71aY6t+nLGcNuGP6un0x7YbK7picWjGXNbRExypOcfa+PTocxQFAUBQFAUC0D218zma/g3ZxHq6pr7kmsLFpdWvvncMPiyx2f5oj+VMZ1wyjZLr1/UXo26Ptxn+UsfLZRtdOvvXAz88p1z6so/wALY8JZeZDq179G3/x7Mc/dMSmFzCyozKoxKsWZVGJVGZVGVRFRARQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAc+3l44zWEdU+v0IrxnlbvXX2QDGzZlsm8vOqBgAAAAAAAFiZibjzgHZqz68In0+lhLOJaAAAAAABJv0A88o5H9Mx9qK877hHlGEg+pwuZo5HAnt3dtUxqiZy07tdZdPV8WOWMz44y0XpaLcq/V0a9lZrxt7PCTkbu28LhTw+1cWM88onHPmThq15Y4TFdOvwnKIY+VN5zbw9zbPc8IxScznxlx9i5vL7PGvDRjuy14ZdWzHLOJnOJm5jKqv2epnbt6zGMNcd3flnL6v7b6Z28j99O7PX4T/APrTq/8AtiJm5wjZHhVsM7fDEZ97LGqevKce5y9x5s8zmbOROPRGVRhh6sYiohu1U41w0bdnO0y5WxqfS7Dq15cvZtzxjP8Abac9+OE+WWWEeEfi0dxM8cR7Zw6e2iOUzPsjL5mH1X3GPqvh6tuW+dWvLHk7c8M5xxzjD83y4qJiMZrx+55XrV7ae1v5eudlsYxHj16Z9/Txer6PrjbvrOzZFIz4z4fxPg+p336w4XG7xxu5fPwx5PM15Rt15TM44zEdNZzHwxVVbybcN/pvHTWbYmuIxi3SYmek+3x+fserp0Wp6hE7rRXMTmc5jrExXrGemcfL2uD6U0aP3HL7ruyw5XO4+ic9XT+bXruaiMPZHpnzl9FG/wA2sTi1eU+2MS8LZonRa0ZraKx04zExPx6M8bvfddfdN0TyN2WU1vwzynKcKy8Jw8fy+cXXtdXk08MOKd1+ls9X0O+6tePM17deMYRydWG/LXHljlnHjH4J28zxxPsnB3NYi2Y9sZfNb3MAAAAAAA1hs2YRWGU4x6omYTC5ay7ht1/FtmPZPinGF5y8su+74+CsvblER/BfLhPNlzb+7c/b4Ts6I9WH5fx81ikQk7Jlx5XlN5Tcz5zPizYJQFAUBQFAUBQFAUBQFAUBQFAUBQFAUD6fY+3cfk7t27lzMcPia5274x88q8Iwj/NLTu2TWIiPGW/Rri0zNv016unj/WOWrvXb+Lo0cTjaM9+EzpnXE1qxnqyymfimax83m+pUpTt7ze0/pnr9Hqemzs276111j9UYjH8fN9X6u7xr/uWv6o43ImNPH3zxcuuaxiMJnpr/AKdmM39rzew7bXb0+dXSYvTl9Zj8YnH2O7vrbK99F5zWa34/SJ/CYy/I8rPj8v6j/uXKy1/t9m2NmnThl1+GyYnPOo8Z8/D2N/ove89FdcxeNlK8etZx0+OML636ZOnba9bUtrvbOeVc4n4Zy7frXTydneOZM/8AnwyjPjTPhFRj+T7Jjwl7XbxHlxh4G+2Ns8vD8nR9GRyJ7vx5ziMY+XnPLiPHCMOieq/ZZ3X/AF9fE7T/ALenh1+x8nOMeqen4bnp9zphySzQFAUBQFAUBQFAUBQFAtA99XN5mv4NuVeqZuPxtOMLFpdWvvXIjw2YY5x648J/mx4Mubp1934ufxdWE+2Lj8E4yvKHTht1bIvXnGXukCVRmVRmVRmVQBFEEAAAAAAAAAAAAAAAAAAAAAAAS49aZXB1wcjinX7E5LxTrlOS8TqkyYhz8ndPwRPvWElzKgAAAAAAAAAACxuz1xWNePimCJJ5O+f6vwgwuWfnbv1yYTJ83b+ufvXBk+du/XKYMrHI3x/X/AwuWo5e6PVP2GDLcc2fTj90pxOT0x5eqfO4MLl6Rt1T5ZR96YXLUTE+U2AAAACZRM+U0Dyz18n+jOI9/wDyRWuDyu8cLl4cjVnrz6Z8cMvLLGfCcZqPSw2Ui0Ylnr2TS2YfXnf9P5T87Lj8iM58Z4uOWHy79UZ+GXS1Y2+GY+bfy0+OJ+T4feIy7pvxz5PA0Tq1eHH04zWOGMeUR4R9rZTVFYx4sL9xaZzHR19u7nzeFyI2xxYzwmJw2a5zissJ88ZXZr5Rhhq2TScvpa9/091fO/b8mMo8Y42c4dF+rqiZmmrG3wzHzbeWnxxPycfO5m3mcnPfsqMsvLGPKIjwiIbtdIrGIadmyb2zLnZtYAAABOWMecxHvB55cnTHpv3GDLyy5n6cftlcJyeOe/dl55VHqjwXDHLzpRKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgfX+n9ujL932/fnGrHna+jDbl5Rsxm8L9lufuInpaP7XT21o61n+6HzOT9H8+O7a9+XF3xytXhjOuJnDKvTcR4+frYbI07a/1Yms+yf+G/Ts7jROKZrb2THj9Jdf1D2/i8ftmHb+Xvyy7hty+bvxwz8NOMR+TGsfyzl6fG3H2PYaNVrTqrFaz97t7/1XudlaxttztH3fzfC4Gjh8HR8nTOWUTPVllPjMzP3PUrEVjo8jbe15zL9Do7/p38fXx+58D93jpjp074znXtxx9UzHxQ0zpmJzScZbI31mMXjlj7XpyO9aceLnxO28WOHp3RW/PqnPbnHqnKfKPYtdM5zacylt8Y40jjE/a+RTocxQFAUBQFAUBQFAUBQFAUBQFAUCxcTcTU+sHRr53Jw8Ovqj1ZeP/FMLl04dzxnw2YTHtjxMGXvhyNGz4c4v1T4T+INyCKiSCKgAAAAAAAADOWzDHzyiEHnlytceVyZXDH7yb+Dw96ZXDpZMQAAAC4TJhOqDK8U6/YnJeKdcpyXinVPrTK4QAAAAAHDll1ZTPrZsEAAAAAAAAAAABmYsCgKAoCgKAoCgKAoCgajLOPLKY+0Go3bo/qTBlqOTtj1SYXLUcvL04wcTk1HLj04/inFeSxytfqkwcl/c6vb9xgyv7jV6/wAJMGT9xp/V+Ephcn7jT+r8JMGT9xp/V+EmEyfudXr/AAXBlP3Wv1SYOTM8vH0YycTkzPLy9GMHFOTM8ndPqj3QuDLE7ds+eUrhMsUBQFAUBQFAUBQFAUBQFAUBQFAUBQFAUBQFAUBQJPgDzz2zHlEJlcPDPkbfRNfYxyuHnGW/PynKfcdV6Po6O4d9w0/Jw527XqqowjZl4R6oqfBhOmszmYhsjfaIxEy8I4mMzOWeU55T4zM+mWyKtU2emOrDH4cYhlhjlqgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgemG/dh8Oc16vOAe+HPy/rxifbHgD3x5WnL+qp9U+APSJifJQEAAAASc8cfOaQw88uRhHlEymVw88uRsnyiIMrh55ZbMvPKZTK4Z6UU6QOkHe2NadUetMrhOtOS8U65TkvFLlMrhAAAAAAAAAAMvhn3A4GbAAAAAAAAAoAACgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgKAoCgZnEGZ0xPnKYMkaNUf03Pt8TBl6VEKFAUBQFAUBQFAUBQFAUBQFAUBQFAUBQFAUBQFAUBQFAUBQFAuOWWPw5THuB7YczZHxVl+EiPbDl6p87xn2qPT5uv0TfuTKxDM7p9EfenJeLE55z5ymVwx0op0gdIHSB0gdIHSDoy+37VlIZRQAAAAAAAAAAAAAHAzYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALj5+n7PMHTj5en7fNgzhoAAAAAAAH/9k=';

function ajax(path, options) {
  options = options || {};
  options.dataType = 'json';
  options.contentType = 'application/json; charset=utf-8';
  options.url = path;
  return $.ajax(options);
}

function Model(params) {
  var vm = this;
  var project_domain = params.project_domain;
  var static_host = params.static_host;
  var pk_id = params.pk_id;
  var pk_api_host = params.pk_api_host;
  var pk_gw_host = params.pk_gw_host;
  var el_mark_host = params.el_mark_host;
  var el_exam_api_host = params.el_exam_api_host;
  var res_srv_host = params.res_srv_host;
  var el_answer_api_host = params.el_answer_api_host;
  var el_note_api_host = params.el_note_api_host;
  var que_bank_gw_host = params.que_bank_gw_host;
  var el_per_exam_gw_host = params.el_per_exam_gw_host;
  var curr_user_id = params.curr_user_id;
  var rival_id = params.rival_id;
  var language = params.language;
  var languageVarl = i18n[language]['learning'];
  var rival_marks = {};
  var paper_questions = {};

  var exam_session_id = void 0;
  var pk_rec_id = void 0;
  var all_questions_count = 0;

  vm.me_user_info = ko.observable({});
  vm.me_exam = ko.observable();
  vm.me_score = ko.observable(0);
  vm.me_progress = ko.observable();

  vm.rival_user_info = ko.observable({});
  vm.rival_exam = ko.observable();
  vm.rival_score = ko.observable(0);
  vm.rival_status = ko.observable();
  vm.rival_progress = ko.observable();

  vm.exam_question_count = ko.observable(1);
  vm.paper_total_questions = ko.observable();
  vm.paper_total_score = ko.observable();
  vm.time_countdown = ko.observable(' ');
  vm.ready_progress = ko.observable(0);
  vm.is_show_ready_popup = ko.observable(false);
  vm.is_loading = ko.observable(true);
  vm.is_alone = !rival_id;
  vm.banner = img;

  init().pipe(function () {
    var me_exam_session = vm.me_exam();

    vm.paper_total_questions(me_exam_session.paper.question_count);
    vm.paper_total_score(me_exam_session.paper.score);
    exam_session_id = me_exam_session.id;

    $.each(me_exam_session.paper.parts, function (idx, part) {
      $.each(part.paper_questions, function (idx, question) {
        paper_questions[question.id] = {
          id: question.id,
          scores: question.scores
        };
      });

      all_questions_count += part.sub_question_count;
    });
  }).pipe(get_rival_marks).pipe(function () {
    vm.is_loading(false);
    vm.is_show_ready_popup(true);
  }).pipe(ready).pipe(function () {
    vm.is_show_ready_popup(false);
    create_exam();
  }).always(function () {
    vm.is_loading(false);
  });
  var me_corrected_count = 0;
  var rival_corrected_count = 0;

  function create_exam() {
    var me_answer_data = void 0;
    require.config({
      baseUrl: static_host
    });
    require(['studying.exam.factory', 'studying.enum'], function (factory, study_enum) {
      var exercise_config = {
        host: {
          'mainHost': el_exam_api_host,
          'resourceGatewayHost': res_srv_host,
          'answerGatewayHost': el_answer_api_host,
          'periodicExamHost': el_per_exam_gw_host,
          'noteServiceHost': el_note_api_host,
          'questionBankServiceHost': que_bank_gw_host,
          'errorUrl': project_domain + '/answer/error',
          'returnUrl': window.self_host + '/' + project_domain + '/pk/' + pk_id + '/' + (vm.is_alone ? 'answer' : 'record') + '/' + pk_rec_id + '/result' },
        envConfig: {
          'sessionId': exam_session_id,
          'macKey': get_local_mac().mac_key,
          'userId': curr_user_id,
          'i18n': languageVarl,
          'element': '#pk_exercise',
          'language': language,
          'displayOptions': {
            "hideTimer": true,
            'hideNavigator': true,
            'showQuestionNum': false,
            'enableQuestionBank': false,
            'showGotoLearnButton': false,
            'showQuizButton': false,
            disablePreButton: true,
            disableNextButton: false
          },
          'answerOptions': {
            'forceToAnswer': false },
          'tokenConfig': {
            'needToken': true,

            'onGetToken': function onGetToken(context) {
              return {
                'Authorization': get_mac_token(context.method, context.path, context.host),
                'X-Gaea-Authorization': 'GAEA id=' + get_g_config().encode_gaea_id
              };
            }
          }
        },
        eventCallBack: {
          onAnswerSaved: function onAnswerSaved(data) {
            me_answer_data = data;
          },
          onAnswerChange: function onAnswerChange(data) {},
          onNumberChanged: function onNumberChanged(question_id, questionAnswerStatus) {},
          onNextButtonClick: function onNextButtonClick(context) {
            if (vm.exam_question_count() >= vm.paper_total_questions()) {
              return;
            }
            var me_answer_question_id = context.currentQuestionId;

            vm.exam_question_count(vm.exam_question_count() + 1);
            if (!me_answer_data || !me_answer_question_id) {
              return;
            }
            var is_me_answer_passed = void 0;
            var question_id = me_answer_question_id;

            var subs_count = 1;
            var answers = me_answer_data.data[0].Result.Answers;
            var answer = answers['RESPONSE_' + subs_count + '-1'];
            while (answer) {
              if (answer.state === 'PASSED') {
                var curr_score = vm.me_score() + paper_questions[question_id].scores[subs_count - 1];

                curr_score = window.parseFloat(curr_score.toFixed(1));
                vm.me_score(curr_score);
                me_corrected_count++;
                vm.me_progress(Math.round(me_corrected_count / all_questions_count * 100));
              }
              subs_count++;
              answer = answers['RESPONSE_' + subs_count + '-1'];
            }

            if (!vm.is_alone && typeof rival_marks[question_id] !== 'undefined') {
              var rival_question_mark = rival_marks[question_id];
              var _curr_score = 0;
              $.each(rival_question_mark.subs, function (idx, sub) {
                _curr_score += sub.score;
                if (sub.status === 2) {
                  rival_corrected_count++;
                }
              });
              _curr_score = vm.rival_score() + _curr_score;
              _curr_score = window.parseFloat(_curr_score.toFixed(1));
              vm.rival_score(_curr_score);
              vm.rival_progress(Math.round(rival_corrected_count / all_questions_count * 100));
            }

            me_answer_data = null;
          },
          onSubmitCallBack: function onSubmitCallBack() {},
          onTimerElapsed: function onTimerElapsed(timer) {
            vm.time_countdown(timer.text);
          }
        }
      };
      var bussiness = factory.Studying.ExamBussinessFactory.CreateSingleModeExam(exercise_config);
      bussiness.init();
    });
  }

  function get_rival_marks() {
    var defer = $.Deferred();
    if (vm.rival_status() != 1) {
      defer.resolve();
    } else {
      get_rival_mark_paper(0, function () {
        defer.resolve();
      }, defer.reject);
    }
    return defer.promise();
  }

  function get_rival_mark_paper(offset, on_done, on_error) {
    var limit = 20;
    ajax(el_mark_host + '/v1/user_question_marks/search', {
      type: 'GET',
      data: {
        $filter: encodeURIComponent('user_paper_mark_id eq ' + vm.rival_exam().user_paper_mark_id),
        $limit: limit,
        $offset: offset,
        $result: 'pager'
      }
    }).then(function (res) {
      $.each(res.items, function (idx, item) {
        rival_marks[item.question_id] = {
          subs: item.subs
        };
      });

      if (offset + limit < vm.paper_total_questions()) {
        get_rival_mark_paper(offset + limit, on_done);
      } else {
        on_done();
      }
    }, on_error);
  }

  function get_g_config() {
    var g_config = window.Nova.base64.decode(window.G_CONFIG);
    return JSON.parse(g_config);
  }

  function get_local_mac() {
    var mac_key = get_g_config().cookie_mac_key;
    var _G__Authorization = $.cookie(mac_key);
    if (!_G__Authorization) {
      throw new Error('_G_MAC获取失败，需调试');
    }
    return JSON.parse(Nova.base64.decode(decodeURIComponent(_G__Authorization)));
  }

  function get_mac_token(method, url, host) {
    return Nova.getMacToken(method, url, host);
  }

  function pk_alone() {
    return ajax(pk_gw_host + '/v1/pk_answers?pk_id=' + pk_id, {
      type: 'POST'
    }).then(function (res) {
      pk_rec_id = res.id;
      set_pk_user('me', res.user, res.user_exam_session);
      return res;
    });
  }

  function pk_against() {
    return ajax(pk_gw_host + '/v1/pk_record/actions/challenge?pk_id=' + pk_id + '&rival_id=' + rival_id, {
      type: 'POST'
    }).then(function (res) {
      pk_rec_id = res.id;

      var pk_seq = ['challenger', 'defender'];
      if (res.challenger.user_id != curr_user_id) {
        pk_seq = ['defender', 'challenger'];
      }
      var me_user_info = res[pk_seq[0]];
      var me_pk_answer = res[pk_seq[0] + '_pk_answer'];
      var me_exam_session = me_pk_answer && me_pk_answer.user_exam_session;

      var rival_user_info = res[pk_seq[1]];
      var rival_pk_answer = res[pk_seq[1] + '_pk_answer'];
      var rival_exam_session = rival_pk_answer && rival_pk_answer.user_exam_session;

      set_pk_user('me', me_user_info, me_exam_session);
      set_pk_user('rival', rival_user_info, rival_exam_session);

      vm.rival_status(rival_pk_answer && rival_pk_answer.status || 0);
      return res;
    });
  }

  function set_pk_user(side, user_info, exam_session) {
    user_info.icon += '&defaultImage=1';
    vm[side + '_user_info'](user_info);
    vm[side + '_exam'](exam_session);
  }

  function init() {
    if (vm.is_alone) {
      return pk_alone();
    }
    return pk_against();
  }

  function ready() {
    var defer = $.Deferred();
    if (vm.is_alone) {
      defer.resolve();
    } else {
      window.setTimeout(function () {
        ready_popup_process(function () {
          defer.resolve();
        });
      }, 1000);
    }
    return defer.promise();
  }

  function ready_popup_process(on_ready) {
    window.setTimeout(function () {
      var progress = vm.ready_progress() + 4;

      if (progress >= 100) {
        progress = 100;
      }
      vm.ready_progress(progress);
      if (progress === 100) {
        window.setTimeout(function () {
          on_ready();
        }, 1000);
      } else {
        ready_popup_process(on_ready);
      }
    }, 100);
  }

  
}

var tpl = "<div class=\"pk-wrap wrapper\">\r\n\r\n  <div class=\"pk-answer-wrap\">\r\n    <!-- 在这里加个类名no-stand-banner即可变成没有对手的样式 -->\r\n    <div class=\"pk-answer-banner\" data-bind=\"css:{'no-stand-banner': is_alone}\">\r\n      <img class=\"banner-bg\" data-bind=\"attr:{src:banner}\">\r\n      <div class=\"banner-cont\">\r\n        <h3 class=\"ico-pk\"></h3>\r\n        <div class=\"timer-wrap\">\r\n          <span class=\"timer\" data-bind=\"text:time_countdown\"></span>\r\n        </div>\r\n        <div class=\"counter-wrap\">\r\n          <!--答题进度-->\r\n          <span class=\"counter\">\r\n            <em data-bind=\"text:exam_question_count\"></em>/<!--ko text:paper_total_questions()--><!--/ko-->\r\n          </span>\r\n        </div>\r\n        <div class=\"pk-double-wrap clearfix\">\r\n          <!--我的PK信息-->\r\n          <dl class=\"pk-stand pk-me\">\r\n            <dt>\r\n              <!--头像-->\r\n              <a><img data-bind=\"attr:{src:me_user_info().icon}\"></a>\r\n              <!--姓名-->\r\n              <span class=\"name\" data-bind=\"text:me_user_info().display_name, attr:{title:me_user_info().display_name}\"></span>\r\n            </dt>\r\n            <dd>\r\n              <!--得分-->\r\n              <span class=\"score\" data-bind=\"translate:{key:'pk_answer.score',properties:{score:me_score()}}\"></span>\r\n              <!--得分进度-->\r\n              <div class=\"progress-bar-wrap orange-progress-bar\">\r\n                <span class=\"bar-bg\"></span>\r\n                <!--进度条-->\r\n                <div class=\"bar-progress-wrap\" data-bind=\"attr:{style:'width:'+me_progress()+'%'}\">\r\n                  <span class=\"bar-progress\"></span>\r\n                  <span class=\"dot\"></span>\r\n                </div>\r\n              </div>\r\n            </dd>\r\n          </dl>\r\n          <!--对方的PK信息-->\r\n          <!--ko if:!is_alone-->\r\n          <dl class=\"pk-stand pk-others\">\r\n            <dt>\r\n              <!--头像-->\r\n              <a><img data-bind=\"attr:{src:rival_user_info().icon}\"></a>\r\n              <!--姓名-->\r\n              <span class=\"name\" data-bind=\"text:rival_user_info().display_name, attr:{title:rival_user_info().display_name}\"></span>\r\n            </dt>\r\n            <dd>\r\n              <!--得分-->\r\n              <!--ko if:rival_status() === 0-->\r\n              <span class=\"score\" data-bind=\"translate:{key:'pk_answer.rival_waiting'}\"></span>\r\n              <!--/ko-->\r\n\r\n              <!--ko if:rival_status() !== 0-->\r\n              <span class=\"score\" data-bind=\"translate:{key:'pk_answer.score',properties:{score:rival_score()}}\"></span>\r\n              <!--/ko-->\r\n\r\n              <!--得分进度-->\r\n              <div class=\"progress-bar-wrap blue-progress-bar\">\r\n                <span class=\"bar-bg\"></span>\r\n                <!--进度条-->\r\n                <div class=\"bar-progress-wrap\" data-bind=\"attr:{style:'width:'+rival_progress()+'%'}\">\r\n                  <span class=\"bar-progress\"></span>\r\n                </div>\r\n              </div>\r\n            </dd>\r\n          </dl>\r\n          <!--/ko-->\r\n        </div>\r\n      </div>\r\n    </div>\r\n\r\n    <!-- 答题区-->\r\n    <div class=\"answer-area-wrapper\">\r\n      <div class=\"answer-area\" id=\"pk_exercise\"></div>\r\n    </div>\r\n  </div>\r\n\r\n  <!--ko if:!is_alone && is_show_ready_popup()-->\r\n  <div class=\"pk-ready-popup\">\r\n    <div class=\"mask\"></div>\r\n    <div class=\"ready-popup\">\r\n      <span class=\"ico-pk\"></span>\r\n      <div class=\"pk-double-wrap clearfix\">\r\n        <!--己方(me)信息-->\r\n        <dl class=\"pk-stand pk-me\">\r\n          <dt>\r\n            <a><img width=\"60\" height=\"60\" data-bind=\"attr:{src:me_user_info().icon}\"></a>\r\n            <span class=\"name\" data-bind=\"translate:{key:'pk_answer.me'}\"></span>\r\n          </dt>\r\n        </dl>\r\n        <!--对手(rival)信息-->\r\n        <dl class=\"pk-stand pk-others\">\r\n          <dt>\r\n            <a><img width=\"60\" height=\"60\" data-bind=\"attr:{src:rival_user_info().icon}\"></a>\r\n            <span class=\"name\" data-bind=\"text:rival_user_info().display_name,attr:{title:rival_user_info().display_name}\"></span>\r\n          </dt>\r\n        </dl>\r\n      </div>\r\n      <!-- 准备进度条 -->\r\n      <div class=\"ready-progress-bar\">\r\n        <span class=\"bar-bg\"></span>\r\n        <div class=\"bar-progress-wrap\" style=\"width:0%\" data-bind=\"attr:{style:'width:'+ready_progress() + '%'}\">\r\n          <span class=\"bar-progress\"></span>\r\n          <span class=\"dot\"></span>\r\n        </div>\r\n      </div>\r\n      <!-- /准备进度条 -->\r\n    </div>\r\n  </div>\r\n  <!--/ko-->\r\n</div>\r\n\r\n<!--ko if:is_loading()-->\r\n<div class=\"pk-answer-loading\">\r\n  <span></span>\r\n</div>\r\n<!--/ko-->";

ko.components.register("x-pk-answer", {
  viewModel: Model,
  template: tpl
});

}(ko,$));
